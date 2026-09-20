package com.keystone.fsm.service;

import com.keystone.fsm.dto.AuthDTOs.*;
import com.keystone.fsm.entity.Customer;
import com.keystone.fsm.entity.Technician;
import com.keystone.fsm.entity.User;
import com.keystone.fsm.entity.enums.Role;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.CustomerRepository;
import com.keystone.fsm.repository.TechnicianRepository;
import com.keystone.fsm.repository.UserRepository;
import com.keystone.fsm.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long customerId = null;
        if (user.getRole() == Role.CUSTOMER) {
            customerId = customerRepository.findByUserId(user.getId())
                    .map(Customer::getId)
                    .orElse(null);
        }

        Long technicianId = null;
        if (user.getRole() == Role.TECHNICIAN) {
            technicianId = technicianRepository.findByUserId(user.getId())
                    .map(Technician::getId)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .customerId(customerId)
                .technicianId(technicianId)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        Long customerId = null;
        Long technicianId = null;
        if (role == Role.CUSTOMER) {
            Customer customer = Customer.builder()
                    .user(savedUser)
                    .companyName(request.getCompanyName() != null ? request.getCompanyName() : request.getUsername() + " Company")
                    .contactPhone(request.getPhone())
                    .build();
            Customer savedCustomer = customerRepository.save(customer);
            customerId = savedCustomer.getId();
        } else if (role == Role.TECHNICIAN) {
            Technician technician = Technician.builder()
                    .user(savedUser)
                    .available(true)
                    .build();
            Technician savedTechnician = technicianRepository.save(technician);
            technicianId = savedTechnician.getId();
        }

        String jwt = tokenProvider.generateTokenFromUsername(savedUser.getUsername());

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .customerId(customerId)
                .technicianId(technicianId)
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Long customerId = customerRepository.findByUserId(user.getId())
                .map(Customer::getId).orElse(null);
        Long technicianId = technicianRepository.findByUserId(user.getId())
                .map(Technician::getId).orElse(null);

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .enabled(user.getEnabled())
                .customerId(customerId)
                .technicianId(technicianId)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
