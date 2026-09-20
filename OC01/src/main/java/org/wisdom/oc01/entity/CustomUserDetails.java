// ============================================
// CustomUserDetails.java - UserDetails wrapper
// ============================================
package org.wisdom.oc01.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.wisdom.oc01.entity.Account;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final Account account;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (account.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + account.getRole().getRoleName()));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return account.getPassword();
    }

    @Override
    public String getUsername() {
        return account.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // ==================== HELPER METHODS ====================

    public Integer getIdAccount() {
        return account.getIdAccount();
    }

    public String getEmail() {
        return account.getEmail();
    }

    public String getRoleName() {
        return account.getRole() != null ? account.getRole().getRoleName() : null;
    }
}