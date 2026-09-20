package org.wisdom.oc01.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.repository.chat.ChatParticipantRepository;
import org.wisdom.oc01.security.CustomUserDetails;
import org.wisdom.oc01.service.AccountService;

import java.security.Principal;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * WebSocket config với 2 lớp auth:
 *  1. CONNECT: fail-closed — thiếu/sai token → reject.
 *  2. SUBSCRIBE/SEND: whitelist destination + check membership.
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final AccountService accountService;
    private final CookieUtil cookieUtil;
    private final ChatParticipantRepository chatParticipantRepository;

    /** Đọc từ application.properties — có thể whitelist nhiều domain prod. */
    @Value("${app.websocket.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String allowedOriginsRaw;

    // Destination patterns
    private static final Pattern USER_TOPIC_PATTERN =
            Pattern.compile("^/topic/user/(\\d+)(/.*)?$");
    private static final Pattern CONVERSATION_TOPIC_PATTERN =
            Pattern.compile("^/topic/conversation/(\\d+)(/.*)?$");

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins)
                .withSockJS()
                .setInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request,
                                                   ServerHttpResponse response,
                                                   WebSocketHandler wsHandler,
                                                   Map<String, Object> attributes) {
                        if (request instanceof ServletServerHttpRequest servletRequest) {
                            HttpServletRequest httpRequest = servletRequest.getServletRequest();
                            Optional<String> tokenOpt =
                                    cookieUtil.getAccessTokenFromCookies(httpRequest);
                            // Chỉ gắn token — không log giá trị token
                            tokenOpt.ifPresent(token -> attributes.put("token", token));
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request,
                                               ServerHttpResponse response,
                                               WebSocketHandler wsHandler,
                                               Exception exception) {
                    }
                });
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class);
                if (accessor == null) return message;

                StompCommand command = accessor.getCommand();
                if (command == null) return message;

                switch (command) {
                    case CONNECT -> handleConnect(accessor);
                    case SUBSCRIBE -> handleSubscribe(accessor);
                    case SEND -> handleSend(accessor);
                    default -> { /* cho qua */ }
                }
                return message;
            }
        });
    }

    // ==================== CONNECT (fail-closed) ====================

    private void handleConnect(StompHeaderAccessor accessor) {
        String token = extractToken(accessor);

        // FIX 1: thiếu token → REJECT (không return message)
        if (token == null || token.isEmpty()) {
            log.warn("[WS] CONNECT rejected: missing token");
            throw new MessagingException("Missing authentication token");
        }

        try {
            String username = jwtService.extractUsername(token);
            if (username == null || !jwtService.validateToken(token)) {
                log.warn("[WS] CONNECT rejected: invalid token");
                throw new MessagingException("Invalid token");
            }

            UserDetails userDetails = accountService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            accessor.setUser(auth);
            log.info("[WS] CONNECT success: user={}", username);
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            // FIX 2: token sai → REJECT (không log token)
            log.warn("[WS] CONNECT rejected: {}", e.getMessage());
            throw new MessagingException("Invalid token");
        }
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // 1. Từ session attributes (đã lưu ở HandshakeInterceptor)
        if (accessor.getSessionAttributes() != null) {
            Object t = accessor.getSessionAttributes().get("token");
            if (t instanceof String s && !s.isEmpty()) return s;
        }
        // 2. Fallback: header Authorization: Bearer ...
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    // ==================== SUBSCRIBE (whitelist destination) ====================

    private void handleSubscribe(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            log.warn("[WS] SUBSCRIBE rejected: no principal");
            throw new MessagingException("Not authenticated");
        }

        String destination = accessor.getDestination();
        if (destination == null) {
            throw new MessagingException("Missing destination");
        }

        Integer currentAccountId = extractAccountId(principal);
        if (currentAccountId == null) {
            throw new MessagingException("Cannot resolve account");
        }

        if (!canSubscribe(destination, currentAccountId)) {
            log.warn("[WS] SUBSCRIBE rejected: user={} dest={}",
                    currentAccountId, destination);
            throw new MessagingException("Forbidden subscription");
        }

        log.debug("[WS] SUBSCRIBE ok: user={} dest={}", currentAccountId, destination);
    }

    /**
     * Fail-closed: chỉ allow destination nằm trong whitelist đã biết.
     * Destination mới phải được thêm vào đây.
     */
    private boolean canSubscribe(String destination, Integer currentAccountId) {
        // 1. /user/** — Spring tự route theo Principal, an toàn
        if (destination.startsWith("/user/")) {
            return true;
        }

        // 2. /topic/user/{id}/... — chỉ id == current user
        Matcher mUser = USER_TOPIC_PATTERN.matcher(destination);
        if (mUser.matches()) {
            Integer targetId = parseSafe(mUser.group(1));
            return targetId != null && targetId.equals(currentAccountId);
        }

        // 3. /topic/conversation/{id}/... — phải là participant của conversation
        Matcher mConv = CONVERSATION_TOPIC_PATTERN.matcher(destination);
        if (mConv.matches()) {
            Integer conversationId = parseSafe(mConv.group(1));
            if (conversationId == null) return false;
            return chatParticipantRepository
                    .existsByConversationIdConversationAndAccountId(
                            conversationId, currentAccountId);
        }

        // 4. Không match whitelist → reject
        return false;
    }

    // ==================== SEND ====================

    private void handleSend(StompHeaderAccessor accessor) {
        // Chặn SEND trực tiếp tới /topic/** — client không được broadcast tùy ý.
        // Chỉ cho phép SEND tới /app/** (application destination, xử lý ở @MessageMapping).
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith("/app/")) {
            log.warn("[WS] SEND rejected: dest={}", destination);
            throw new MessagingException("Forbidden destination");
        }

        if (accessor.getUser() == null) {
            throw new MessagingException("Not authenticated");
        }
    }

    // ==================== HELPERS ====================

    private Integer extractAccountId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            Object p = auth.getPrincipal();
            if (p instanceof CustomUserDetails cud && cud.getAccount() != null) {
                return cud.getAccount().getIdAccount();
            }
            if (p instanceof Account acc) {
                return acc.getIdAccount();
            }
        }
        return null;
    }

    private Integer parseSafe(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}