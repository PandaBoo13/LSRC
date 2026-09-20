package org.wisdom.oc01.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.wisdom.oc01.entity.Account;
import org.wisdom.oc01.entity.User;
import org.wisdom.oc01.repository.AccountRepository;

@Component
@RequiredArgsConstructor
public class AuditLogHelper {

    private final AccountRepository accountRepository;

    public String getActorName(Integer accountId) {
        return accountRepository.findById(accountId)
                .map(account -> {
                    User user = account.getUser();
                    if (user != null) {
                        return user.getFirstName() + " " + user.getLastName();
                    }
                    return account.getUsername();
                })
                .orElse("Unknown");
    }

    public String getActorRole(Integer accountId) {
        return accountRepository.findById(accountId)
                .map(account -> account.getRole() != null ? account.getRole().getRoleName() : "UNKNOWN")
                .orElse("UNKNOWN");
    }
}