package com.keystone.fsm.dto;

import lombok.*;

import java.time.LocalDateTime;

public class TechnicianDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TechnicianResponse {
        private Long id;
        private Long userId;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String skills;
        private String certifications;
        private Boolean available;
        private String notes;
        private LocalDateTime createdAt;
        private long activeWorkOrdersCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTechnicianRequest {
        private Long userId; // if linking existing user
        private String username; // if creating new user
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phone;
        private String skills;
        private String certifications;
        private Boolean available;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateTechnicianRequest {
        private String skills;
        private String certifications;
        private Boolean available;
        private String notes;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
    }
}
