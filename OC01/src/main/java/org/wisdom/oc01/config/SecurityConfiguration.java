package org.wisdom.oc01.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.wisdom.oc01.dto.RequestResponse;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.security.CustomUserDetails;
import org.wisdom.oc01.service.AccountService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration implements WebMvcConfigurer {

    private final JwtFilter jwtFilter;
    private final AccountService accountService;
    private final PermissionMappingFilter permissionMappingFilter;

    /** Lấy từ application.properties; mặc định "uploads". */
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public SecurityConfiguration(@Lazy JwtFilter jwtFilter,
                                 @Lazy AccountService accountService,
                                 @Lazy PermissionMappingFilter permissionMappingFilter) {
        this.jwtFilter = jwtFilter;
        this.accountService = accountService;
        this.permissionMappingFilter = permissionMappingFilter;
    }

    // ==================== STATIC RESOURCES ====================

    /**
     * Map URL /uploads/** to thư mục uploads/ trên disk.
     *
     * FIXED [CRITICAL]: dùng Path.toUri().toString() thay vì string concat.
     *  - Trước: "file:" + path → trên Windows ra file:C:/Users/.../uploads
     *    KHÔNG phải URI hợp lệ → Spring Boot silently fail → 404.
     *  - Sau: path.toUri() → file:///C:/Users/.../uploads/ — đúng format URI.
     *
     * LƯU Ý: comment không được chứa ký tự backslash + u liền nhau,
     * vì Java compiler sẽ hiểu là Unicode escape và báo "illegal unicode escape"
     * ngay cả khi nó nằm trong comment.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = uploadPath.toUri().toString();

        // ==================== DEBUG LOG ====================
        System.out.println("=======================================================");
        System.out.println("[StaticResource] user.dir          = " + System.getProperty("user.dir"));
        System.out.println("[StaticResource] uploadDir         = " + uploadDir);
        System.out.println("[StaticResource] absolute path     = " + uploadPath);
        System.out.println("[StaticResource] serving URI       = " + location);
        System.out.println("[StaticResource] folder exists?    = " + Files.exists(uploadPath));
        System.out.println("[StaticResource] folder readable?  = " + Files.isReadable(uploadPath));
        System.out.println("=======================================================");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }

    // ==================== SECURITY FILTER CHAIN ====================

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static files — PHẢI đặt TRƯỚC các rule authenticated
                        .requestMatchers("/uploads/**").permitAll()
                        // WebSocket handshake
                        .requestMatchers("/ws/**", "/ws").permitAll()
                        // Chat REST API yêu cầu authenticated
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers(APIURL.PUBLIC_URLS).permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(new ObjectMapper().writeValueAsString(
                                    new RequestResponse("Authentication required")));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(new ObjectMapper().writeValueAsString(
                                    new RequestResponse("Access denied")));
                        })
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(permissionMappingFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // ==================== AUTHENTICATION ====================

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService((UserDetailsService) accountService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // ==================== CORS ====================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "https://lsrc.wisdombrain.org"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ==================== OAUTH2 ====================

    @Bean
    public OidcUserService oidcUserService() {
        return new OidcUserService();
    }

    @Bean
    public DefaultOAuth2UserService oAuth2UserService() {
        return new DefaultOAuth2UserService();
    }

    // ==================== ACCOUNT PRINCIPAL RESOLVER ====================

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType().equals(Account.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null
                        || !authentication.isAuthenticated()
                        || "anonymousUser".equals(authentication.getPrincipal())) {
                    return null;
                }
                Object principal = authentication.getPrincipal();
                if (principal instanceof CustomUserDetails customUserDetails) {
                    return customUserDetails.getAccount();
                }
                if (principal instanceof Account account) {
                    return account;
                }
                return null;
            }
        });
    }
}