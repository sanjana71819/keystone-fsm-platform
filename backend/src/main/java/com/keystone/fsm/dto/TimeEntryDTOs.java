package com.keystone.fsm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class TimeEntryDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeEntryResponse {
        private Long id;
        private Long workOrderId;
        private Long technicianId;
        private String technicianName;
        private LocalDateTime clockIn;
        private LocalDateTime clockOut;
        private Double durationHours;
        private String notes;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClockInRequest {
        @NotNull(message = "Work order ID is required")
        private Long workOrderId;
        private Long technicianId; // optional if inferred from authenticated technician
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClockOutRequest {
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTimeEntryRequest {
        @NotNull(message = "Work order ID is required")
        private Long workOrderId;
        private Long technicianId;
        @NotNull(message = "Clock in time is required")
        private LocalDateTime clockIn;
        private LocalDateTime clockOut;
        private String notes;
    }
}
