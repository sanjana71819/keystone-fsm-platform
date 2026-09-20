package com.keystone.fsm.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

public class DashboardDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStatsResponse {
        private long totalServiceRequests;
        private long openServiceRequests;
        private long inProgressServiceRequests;
        private long resolvedServiceRequests;
        private long overdueServiceRequests;

        private long totalWorkOrders;
        private long openWorkOrders;
        private long assignedWorkOrders;
        private long inProgressWorkOrders;
        private long completedWorkOrders;

        private long totalTechnicians;
        private long availableTechnicians;

        private long totalCustomers;
        private long totalFacilities;

        private long totalParts;
        private long lowStockPartsCount;

        private Double totalHoursLogged;

        private Map<String, Long> requestsByPriority;
        private Map<String, Long> workOrdersByStatus;
        private List<TechnicianPerformance> technicianPerformances;
        private List<RecentActivity> recentActivities;
        private List<MonthlyTrend> monthlyTrends;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TechnicianPerformance {
        private Long technicianId;
        private String technicianName;
        private long activeOrders;
        private long completedOrders;
        private Double totalHours;
        private Boolean available;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentActivity {
        private String id;
        private String type; // SERVICE_REQUEST, WORK_ORDER, TIME_ENTRY
        private String title;
        private String status;
        private String entityName;
        private String timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String month;
        private long requestsCount;
        private long completedOrdersCount;
    }
}
