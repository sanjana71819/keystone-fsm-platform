package com.keystone.fsm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PartDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartResponse {
        private Long id;
        private String name;
        private String sku;
        private String description;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private Boolean isLowStock;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePartRequest {
        @NotBlank(message = "Part name is required")
        private String name;

        @NotBlank(message = "SKU is required")
        private String sku;

        private String description;

        @NotNull(message = "Unit price is required")
        @DecimalMin(value = "0.0", inclusive = true)
        private BigDecimal unitPrice;

        @NotNull(message = "Stock quantity is required")
        @Min(0)
        private Integer stockQuantity;

        @NotNull(message = "Reorder level is required")
        @Min(0)
        private Integer reorderLevel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdatePartRequest {
        private String name;
        private String sku;
        private String description;
        private BigDecimal unitPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddPartUsageRequest {
        @NotNull(message = "Part ID is required")
        private Long partId;

        @NotNull(message = "Quantity is required")
        @Min(1)
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkOrderPartResponse {
        private Long id;
        private Long partId;
        private String partName;
        private String sku;
        private Integer quantityUsed;
        private BigDecimal unitPrice;
        private BigDecimal totalCost;
    }
}
