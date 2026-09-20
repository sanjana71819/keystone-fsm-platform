package com.keystone.fsm.dto;

import com.keystone.fsm.entity.enums.Priority;
import com.keystone.fsm.entity.enums.RequestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class ServiceRequestDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceRequestResponse {
        private Long id;
        private Long customerId;
        private String customerCompanyName;
        private String customerContact;
        private Long facilityId;
        private String facilityName;
        private String facilityAddress;
        private String title;
        private String description;
        private Priority priority;
        private RequestStatus status;
        private Integer slaHours;
        private LocalDateTime dueAt;
        private LocalDateTime resolvedAt;
        private Boolean isOverdue;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long workOrderId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateServiceRequest {
        private Long customerId; // optional if customer is making the request (inferred from auth)
        private Long facilityId;

        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Priority is required")
        private Priority priority;

        private Integer slaHours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateServiceRequest {
        private Long facilityId;
        private String title;
        private String description;
        private Priority priority;
        private RequestStatus status;
        private Integer slaHours;
    }
}
