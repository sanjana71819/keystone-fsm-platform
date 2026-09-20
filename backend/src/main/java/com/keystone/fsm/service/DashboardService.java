package com.keystone.fsm.service;

import com.keystone.fsm.dto.DashboardDTOs.*;
import com.keystone.fsm.entity.Technician;
import com.keystone.fsm.entity.TimeEntry;
import com.keystone.fsm.entity.enums.Priority;
import com.keystone.fsm.entity.enums.RequestStatus;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TechnicianRepository technicianRepository;
    private final CustomerRepository customerRepository;
    private final FacilityRepository facilityRepository;
    private final PartRepository partRepository;
    private final TimeEntryRepository timeEntryRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();

        // Service Request counts
        long totalRequests = serviceRequestRepository.count();
        long openRequests = serviceRequestRepository.countByStatus(RequestStatus.OPEN);
        long inProgressRequests = serviceRequestRepository.countByStatus(RequestStatus.IN_PROGRESS);
        long resolvedRequests = serviceRequestRepository.countByStatus(RequestStatus.RESOLVED)
                + serviceRequestRepository.countByStatus(RequestStatus.CLOSED);
        long overdueRequests = serviceRequestRepository.countOverdueRequests(now);

        // Work Order counts
        long totalOrders = workOrderRepository.count();
        long openOrders = workOrderRepository.countByStatus(WorkOrderStatus.OPEN);
        long assignedOrders = workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED);
        long inProgressOrders = workOrderRepository.countByStatus(WorkOrderStatus.IN_PROGRESS);
        long completedOrders = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);

        // Technicians
        long totalTechs = technicianRepository.count();
        long availableTechs = technicianRepository.countByAvailableTrue();

        // Customer & Facilities
        long totalCusts = customerRepository.count();
        long totalFacs = facilityRepository.count();

        // Inventory
        long totalParts = partRepository.count();
        long lowStockParts = partRepository.countLowStockParts();

        // Hours logged
        List<TimeEntry> allEntries = timeEntryRepository.findAll();
        double totalHours = allEntries.stream()
                .filter(t -> t.getClockIn() != null && t.getClockOut() != null)
                .mapToDouble(t -> (double) Duration.between(t.getClockIn(), t.getClockOut()).toMinutes() / 60.0)
                .sum();

        // Requests by Priority
        Map<String, Long> requestsByPriority = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            requestsByPriority.put(p.name(), serviceRequestRepository.countByPriority(p));
        }

        // Work orders by status
        Map<String, Long> workOrdersByStatus = new LinkedHashMap<>();
        for (WorkOrderStatus s : WorkOrderStatus.values()) {
            workOrdersByStatus.put(s.name(), workOrderRepository.countByStatus(s));
        }

        // Technician Performance
        List<Technician> technicians = technicianRepository.findAll();
        List<TechnicianPerformance> techPerformances = technicians.stream().map(tech -> {
            long active = workOrderRepository.countByTechnicianIdAndStatusIn(
                    tech.getId(), List.of(WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS));
            long completed = workOrderRepository.countByTechnicianIdAndStatus(
                    tech.getId(), WorkOrderStatus.COMPLETED);

            List<TimeEntry> techEntries = timeEntryRepository.findByTechnicianId(tech.getId());
            double hours = techEntries.stream()
                    .filter(t -> t.getClockIn() != null && t.getClockOut() != null)
                    .mapToDouble(t -> (double) Duration.between(t.getClockIn(), t.getClockOut()).toMinutes() / 60.0)
                    .sum();

            String name = (tech.getUser() != null)
                    ? tech.getUser().getFirstName() + " " + tech.getUser().getLastName()
                    : "Technician #" + tech.getId();

            return TechnicianPerformance.builder()
                    .technicianId(tech.getId())
                    .technicianName(name)
                    .activeOrders(active)
                    .completedOrders(completed)
                    .totalHours(Math.round(hours * 100.0) / 100.0)
                    .available(tech.getAvailable())
                    .build();
        }).collect(Collectors.toList());

        // Recent Activity
        List<RecentActivity> recentActivities = new ArrayList<>();
        serviceRequestRepository.findTop10ByOrderByCreatedAtDesc().forEach(sr -> {
            recentActivities.add(RecentActivity.builder()
                    .id("SR-" + sr.getId())
                    .type("SERVICE_REQUEST")
                    .title(sr.getTitle())
                    .status(sr.getStatus().name())
                    .entityName(sr.getCustomer() != null ? sr.getCustomer().getCompanyName() : "Unknown")
                    .timestamp(sr.getCreatedAt() != null ? sr.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                    .build());
        });

        workOrderRepository.findTop10ByOrderByCreatedAtDesc().forEach(wo -> {
            recentActivities.add(RecentActivity.builder()
                    .id("WO-" + wo.getId())
                    .type("WORK_ORDER")
                    .title("Work Order #" + wo.getId() + (wo.getServiceRequest() != null ? ": " + wo.getServiceRequest().getTitle() : ""))
                    .status(wo.getStatus().name())
                    .entityName(wo.getTechnician() != null && wo.getTechnician().getUser() != null ?
                            wo.getTechnician().getUser().getFirstName() + " " + wo.getTechnician().getUser().getLastName() : "Unassigned")
                    .timestamp(wo.getCreatedAt() != null ? wo.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                    .build());
        });

        recentActivities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        if (recentActivities.size() > 10) {
            recentActivities.subList(10, recentActivities.size()).clear();
        }

        return DashboardStatsResponse.builder()
                .totalServiceRequests(totalRequests)
                .openServiceRequests(openRequests)
                .inProgressServiceRequests(inProgressRequests)
                .resolvedServiceRequests(resolvedRequests)
                .overdueServiceRequests(overdueRequests)
                .totalWorkOrders(totalOrders)
                .openWorkOrders(openOrders)
                .assignedWorkOrders(assignedOrders)
                .inProgressWorkOrders(inProgressOrders)
                .completedWorkOrders(completedOrders)
                .totalTechnicians(totalTechs)
                .availableTechnicians(availableTechs)
                .totalCustomers(totalCusts)
                .totalFacilities(totalFacs)
                .totalParts(totalParts)
                .lowStockPartsCount(lowStockParts)
                .totalHoursLogged(Math.round(totalHours * 100.0) / 100.0)
                .requestsByPriority(requestsByPriority)
                .workOrdersByStatus(workOrdersByStatus)
                .technicianPerformances(techPerformances)
                .recentActivities(recentActivities)
                .build();
    }
}
