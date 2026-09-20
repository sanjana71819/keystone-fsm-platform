package com.keystone.fsm.service;

import com.keystone.fsm.dto.PartDTOs;
import com.keystone.fsm.dto.TimeEntryDTOs;
import com.keystone.fsm.dto.WorkOrderDTOs.*;
import com.keystone.fsm.entity.*;
import com.keystone.fsm.entity.enums.RequestStatus;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TechnicianRepository technicianRepository;
    private final WorkOrderPartRepository workOrderPartRepository;
    private final TimeEntryRepository timeEntryRepository;

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getAllWorkOrders() {
        return workOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getWorkOrdersByTechnician(Long technicianId) {
        return workOrderRepository.findByTechnicianIdOrderByCreatedAtDesc(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> getWorkOrdersByCustomer(Long customerId) {
        return workOrderRepository.findByServiceRequestCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse getWorkOrderById(Long id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));
        return mapToResponse(wo);
    }

    @Transactional
    public WorkOrderResponse createWorkOrder(CreateWorkOrderRequest request) {
        ServiceRequest sr = serviceRequestRepository.findById(request.getServiceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", request.getServiceRequestId()));

        Technician tech = null;
        WorkOrderStatus initialStatus = WorkOrderStatus.OPEN;

        if (request.getTechnicianId() != null) {
            tech = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", request.getTechnicianId()));
            initialStatus = WorkOrderStatus.ASSIGNED;
        }

        WorkOrder wo = WorkOrder.builder()
                .serviceRequest(sr)
                .technician(tech)
                .status(initialStatus)
                .scheduledAt(request.getScheduledAt())
                .description(request.getDescription() != null ? request.getDescription() : sr.getDescription())
                .notes(request.getNotes())
                .build();

        return mapToResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse assignTechnician(Long id, AssignTechnicianRequest request) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));

        Technician tech = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician", request.getTechnicianId()));

        wo.setTechnician(tech);
        if (request.getScheduledAt() != null) {
            wo.setScheduledAt(request.getScheduledAt());
        }
        if (wo.getStatus() == WorkOrderStatus.OPEN) {
            wo.setStatus(WorkOrderStatus.ASSIGNED);
        }

        return mapToResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse updateStatus(Long id, UpdateStatusRequest request) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));

        WorkOrderStatus newStatus = request.getStatus();
        wo.setStatus(newStatus);

        if (request.getNotes() != null) {
            String currentNotes = wo.getNotes() != null ? wo.getNotes() + "\n" : "";
            wo.setNotes(currentNotes + "[" + newStatus + "] " + request.getNotes());
        }

        LocalDateTime now = LocalDateTime.now();
        if (newStatus == WorkOrderStatus.IN_PROGRESS && wo.getStartedAt() == null) {
            wo.setStartedAt(now);
            ServiceRequest sr = wo.getServiceRequest();
            if (sr != null && sr.getStatus() == RequestStatus.OPEN) {
                sr.setStatus(RequestStatus.IN_PROGRESS);
                serviceRequestRepository.save(sr);
            }
        } else if (newStatus == WorkOrderStatus.COMPLETED) {
            wo.setCompletedAt(now);
            ServiceRequest sr = wo.getServiceRequest();
            if (sr != null) {
                sr.setStatus(RequestStatus.RESOLVED);
                sr.setResolvedAt(now);
                serviceRequestRepository.save(sr);
            }
        }

        return mapToResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public WorkOrderResponse updateWorkOrder(Long id, UpdateWorkOrderRequest request) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", id));

        if (request.getTechnicianId() != null) {
            Technician tech = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", request.getTechnicianId()));
            wo.setTechnician(tech);
            if (wo.getStatus() == WorkOrderStatus.OPEN) {
                wo.setStatus(WorkOrderStatus.ASSIGNED);
            }
        }

        if (request.getStatus() != null) {
            wo.setStatus(request.getStatus());
            if (request.getStatus() == WorkOrderStatus.COMPLETED && wo.getCompletedAt() == null) {
                wo.setCompletedAt(LocalDateTime.now());
            }
        }

        if (request.getScheduledAt() != null) wo.setScheduledAt(request.getScheduledAt());
        if (request.getDescription() != null) wo.setDescription(request.getDescription());
        if (request.getNotes() != null) wo.setNotes(request.getNotes());

        return mapToResponse(workOrderRepository.save(wo));
    }

    @Transactional
    public void deleteWorkOrder(Long id) {
        if (!workOrderRepository.existsById(id)) {
            throw new ResourceNotFoundException("WorkOrder", id);
        }
        workOrderRepository.deleteById(id);
    }

    public WorkOrderResponse mapToResponse(WorkOrder wo) {
        ServiceRequest sr = wo.getServiceRequest();
        Customer cust = sr != null ? sr.getCustomer() : null;
        Facility fac = sr != null ? sr.getFacility() : null;
        Technician tech = wo.getTechnician();
        User techUser = tech != null ? tech.getUser() : null;

        List<WorkOrderPart> partsList = workOrderPartRepository.findByWorkOrderId(wo.getId());
        List<PartDTOs.WorkOrderPartResponse> partResponses = partsList.stream().map(p -> {
            BigDecimal total = p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantityUsed()));
            return PartDTOs.WorkOrderPartResponse.builder()
                    .id(p.getId())
                    .partId(p.getPart().getId())
                    .partName(p.getPart().getName())
                    .sku(p.getPart().getSku())
                    .quantityUsed(p.getQuantityUsed())
                    .unitPrice(p.getUnitPrice())
                    .totalCost(total)
                    .build();
        }).collect(Collectors.toList());

        List<TimeEntry> timeEntries = timeEntryRepository.findByWorkOrderId(wo.getId());
        List<TimeEntryDTOs.TimeEntryResponse> timeResponses = timeEntries.stream().map(t -> {
            Double hours = null;
            if (t.getClockIn() != null && t.getClockOut() != null) {
                hours = (double) Duration.between(t.getClockIn(), t.getClockOut()).toMinutes() / 60.0;
            }
            User u = t.getTechnician() != null ? t.getTechnician().getUser() : null;
            return TimeEntryDTOs.TimeEntryResponse.builder()
                    .id(t.getId())
                    .workOrderId(wo.getId())
                    .technicianId(t.getTechnician() != null ? t.getTechnician().getId() : null)
                    .technicianName(u != null ? u.getFirstName() + " " + u.getLastName() : "Unknown")
                    .clockIn(t.getClockIn())
                    .clockOut(t.getClockOut())
                    .durationHours(hours != null ? Math.round(hours * 100.0) / 100.0 : null)
                    .notes(t.getNotes())
                    .createdAt(t.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        double totalHours = timeResponses.stream()
                .filter(t -> t.getDurationHours() != null)
                .mapToDouble(TimeEntryDTOs.TimeEntryResponse::getDurationHours)
                .sum();

        double totalPartsCost = partResponses.stream()
                .filter(p -> p.getTotalCost() != null)
                .mapToDouble(p -> p.getTotalCost().doubleValue())
                .sum();

        return WorkOrderResponse.builder()
                .id(wo.getId())
                .serviceRequestId(sr != null ? sr.getId() : null)
                .serviceRequestTitle(sr != null ? sr.getTitle() : null)
                .customerCompanyName(cust != null ? cust.getCompanyName() : null)
                .facilityName(fac != null ? fac.getName() : null)
                .facilityAddress(fac != null ? fac.getAddress() + ", " + fac.getCity() : null)
                .technicianId(tech != null ? tech.getId() : null)
                .technicianName(techUser != null ? techUser.getFirstName() + " " + techUser.getLastName() : null)
                .technicianPhone(techUser != null ? techUser.getPhone() : null)
                .status(wo.getStatus())
                .scheduledAt(wo.getScheduledAt())
                .startedAt(wo.getStartedAt())
                .completedAt(wo.getCompletedAt())
                .description(wo.getDescription())
                .notes(wo.getNotes())
                .createdAt(wo.getCreatedAt())
                .updatedAt(wo.getUpdatedAt())
                .parts(partResponses)
                .timeEntries(timeResponses)
                .totalHours(Math.round(totalHours * 100.0) / 100.0)
                .totalPartsCost(Math.round(totalPartsCost * 100.0) / 100.0)
                .build();
    }
}
