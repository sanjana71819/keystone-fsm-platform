package com.keystone.fsm.security;

import com.keystone.fsm.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("customerSecurity")
@RequiredArgsConstructor
public class CustomerSecurity {

    private final CustomerRepository customerRepository;

    public boolean isCurrentCustomer(Authentication authentication, Long customerId) {
        if (authentication == null || customerId == null) {
            return false;
        }
        String username = authentication.getName();
        return customerRepository.findById(customerId)
                .map(c -> c.getUser() != null && username.equals(c.getUser().getUsername()))
                .orElse(false);
    }
}
