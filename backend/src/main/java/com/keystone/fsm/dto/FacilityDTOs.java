package com.keystone.fsm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class FacilityDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FacilityResponse {
        private Long id;
        private Long customerId;
        private String customerCompanyName;
        private String name;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String contactName;
        private String contactPhone;
        private String notes;
        private Boolean active;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateFacilityRequest {
        @NotNull(message = "Customer ID is required")
        private Long customerId;

        @NotBlank(message = "Facility name is required")
        private String name;

        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String contactName;
        private String contactPhone;
        private String notes;
        private Boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateFacilityRequest {
        private String name;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String contactName;
        private String contactPhone;
        private String notes;
        private Boolean active;
    }
}
