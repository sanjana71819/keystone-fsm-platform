package com.keystone.fsm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class CustomerDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerResponse {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String companyName;
        private String contactPhone;
        private String billingAddress;
        private String notes;
        private LocalDateTime createdAt;
        private int facilitiesCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateCustomerRequest {
        private Long userId; // optional if creating for existing user
        private String username; // if creating new user
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        @NotBlank(message = "Company name is required")
        private String companyName;
        private String contactPhone;
        private String billingAddress;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateCustomerRequest {
        private String companyName;
        private String contactPhone;
        private String billingAddress;
        private String notes;
        private String firstName;
        private String lastName;
        private String email;
    }
}
