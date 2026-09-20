package com.keystone.fsm.service;

import com.keystone.fsm.dto.CustomerDTOs.*;
import com.keystone.fsm.entity.Customer;
import com.keystone.fsm.entity.User;
import com.keystone.fsm.entity.enums.Role;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.CustomerRepository;
import com.keystone.fsm.repository.FacilityRepository;
import com.keystone.fsm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        return mapToResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user id: " + userId));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        } else {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }

            user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(StringUtils.hasText(request.getPassword()) ? request.getPassword() : "customer123"))
                    .role(Role.CUSTOMER)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getContactPhone())
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        Customer customer = Customer.builder()
                .user(user)
                .companyName(request.getCompanyName())
                .contactPhone(request.getContactPhone())
                .billingAddress(request.getBillingAddress())
                .notes(request.getNotes())
                .build();

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        if (request.getCompanyName() != null) customer.setCompanyName(request.getCompanyName());
        if (request.getContactPhone() != null) customer.setContactPhone(request.getContactPhone());
        if (request.getBillingAddress() != null) customer.setBillingAddress(request.getBillingAddress());
        if (request.getNotes() != null) customer.setNotes(request.getNotes());

        User user = customer.getUser();
        if (user != null) {
            if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
            if (request.getLastName() != null) user.setLastName(request.getLastName());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customerRepository.deleteById(id);
    }

    public CustomerResponse mapToResponse(Customer customer) {
        int facilitiesCount = (int) facilityRepository.countByCustomerId(customer.getId());
        User user = customer.getUser();
        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .companyName(customer.getCompanyName())
                .contactPhone(customer.getContactPhone())
                .billingAddress(customer.getBillingAddress())
                .notes(customer.getNotes())
                .createdAt(customer.getCreatedAt())
                .facilitiesCount(facilitiesCount)
                .build();
    }
}
