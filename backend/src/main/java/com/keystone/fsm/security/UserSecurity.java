package com.keystone.fsm.security;

import com.keystone.fsm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final UserRepository userRepository;

    public boolean isCurrentUser(Authentication authentication, Long userId) {
        if (authentication == null || userId == null) {
            return false;
        }
        return userRepository.findById(userId)
                .map(u -> authentication.getName().equals(u.getUsername()))
                .orElse(false);
    }
}
