package com.keystone.fsm.dto;

import com.keystone.fsm.entity.enums.WorkOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class WorkOrderDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkOrderResponse {
        private Long id;
        private Long serviceRequestId;
        private String serviceRequestTitle;
        private String customerCompanyName;
        private String facilityName;
        private String facilityAddress;
        private Long technicianId;
        private String technicianName;
        private String technicianPhone;
        private WorkOrderStatus status;
        private LocalDateTime scheduledAt;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private String description;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<PartDTOs.WorkOrderPartResponse> parts;
        private List<TimeEntryDTOs.TimeEntryResponse> timeEntries;
        private Double totalHours;
        private Double totalPartsCost;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateWorkOrderRequest {
        @NotNull(message = "Service Request ID is required")
        private Long serviceRequestId;
        private Long technicianId;
        private LocalDateTime scheduledAt;
        private String description;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateWorkOrderRequest {
        private Long technicianId;
        private WorkOrderStatus status;
        private LocalDateTime scheduledAt;
        private String description;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssignTechnicianRequest {
        @NotNull(message = "Technician ID is required")
        private Long technicianId;
        private LocalDateTime scheduledAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private WorkOrderStatus status;
        private String notes;
    }
}
