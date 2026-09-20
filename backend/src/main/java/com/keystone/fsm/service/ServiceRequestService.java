package com.keystone.fsm.service;

import com.keystone.fsm.dto.ServiceRequestDTOs.*;
import com.keystone.fsm.entity.Customer;
import com.keystone.fsm.entity.Facility;
import com.keystone.fsm.entity.ServiceRequest;
import com.keystone.fsm.entity.WorkOrder;
import com.keystone.fsm.entity.enums.Priority;
import com.keystone.fsm.entity.enums.RequestStatus;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.CustomerRepository;
import com.keystone.fsm.repository.FacilityRepository;
import com.keystone.fsm.repository.ServiceRequestRepository;
import com.keystone.fsm.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final CustomerRepository customerRepository;
    private final FacilityRepository facilityRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getAllRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getRequestsByCustomer(Long customerId) {
        return serviceRequestRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestResponse> getOverdueRequests() {
        return serviceRequestRepository.findOverdueRequests(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceRequestResponse getRequestById(Long id) {
        ServiceRequest req = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id));
        return mapToResponse(req);
    }

    @Transactional
    public ServiceRequestResponse createRequest(CreateServiceRequest request, String currentUsername) {
        Customer customer;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        } else {
            customer = customerRepository.findByUserUsername(currentUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for user: " + currentUsername));
        }

        Facility facility = null;
        if (request.getFacilityId() != null) {
            facility = facilityRepository.findById(request.getFacilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Facility", request.getFacilityId()));
        }

        // SLA calculation default based on priority if not explicitly provided
        int slaHours = request.getSlaHours() != null ? request.getSlaHours() : calculateDefaultSla(request.getPriority());
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueAt = now.plusHours(slaHours);

        ServiceRequest serviceRequest = ServiceRequest.builder()
                .customer(customer)
                .facility(facility)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(RequestStatus.OPEN)
                .slaHours(slaHours)
                .dueAt(dueAt)
                .build();

        ServiceRequest saved = serviceRequestRepository.save(serviceRequest);

        // Auto-create initial open work order for the service request
        WorkOrder workOrder = WorkOrder.builder()
                .serviceRequest(saved)
                .status(WorkOrderStatus.OPEN)
                .description(saved.getDescription())
                .build();
        workOrderRepository.save(workOrder);

        return mapToResponse(saved);
    }

    @Transactional
    public ServiceRequestResponse updateRequest(Long id, UpdateServiceRequest request) {
        ServiceRequest req = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest", id));

        if (request.getTitle() != null) req.setTitle(request.getTitle());
        if (request.getDescription() != null) req.setDescription(request.getDescription());
        if (request.getPriority() != null) req.setPriority(request.getPriority());

        if (request.getFacilityId() != null) {
            Facility facility = facilityRepository.findById(request.getFacilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Facility", request.getFacilityId()));
            req.setFacility(facility);
        }

        if (request.getStatus() != null) {
            req.setStatus(request.getStatus());
            if (request.getStatus() == RequestStatus.RESOLVED || request.getStatus() == RequestStatus.CLOSED) {
                req.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getSlaHours() != null) {
            req.setSlaHours(request.getSlaHours());
            req.setDueAt(req.getCreatedAt().plusHours(request.getSlaHours()));
        }

        return mapToResponse(serviceRequestRepository.save(req));
    }

    @Transactional
    public void deleteRequest(Long id) {
        if (!serviceRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceRequest", id);
        }
        serviceRequestRepository.deleteById(id);
    }

    private int calculateDefaultSla(Priority priority) {
        if (priority == null) return 24;
        return switch (priority) {
            case CRITICAL -> 4;
            case HIGH -> 12;
            case MEDIUM -> 24;
            case LOW -> 48;
        };
    }

    public ServiceRequestResponse mapToResponse(ServiceRequest req) {
        LocalDateTime now = LocalDateTime.now();
        boolean isOverdue = req.getDueAt() != null
                && req.getDueAt().isBefore(now)
                && req.getStatus() != RequestStatus.RESOLVED
                && req.getStatus() != RequestStatus.CLOSED
                && req.getStatus() != RequestStatus.CANCELLED;

        Optional<WorkOrder> workOrder = workOrderRepository.findByServiceRequestId(req.getId());

        Customer cust = req.getCustomer();
        Facility fac = req.getFacility();

        return ServiceRequestResponse.builder()
                .id(req.getId())
                .customerId(cust != null ? cust.getId() : null)
                .customerCompanyName(cust != null ? cust.getCompanyName() : null)
                .customerContact(cust != null && cust.getUser() != null ? cust.getUser().getFirstName() + " " + cust.getUser().getLastName() : null)
                .facilityId(fac != null ? fac.getId() : null)
                .facilityName(fac != null ? fac.getName() : null)
                .facilityAddress(fac != null ? fac.getAddress() + ", " + fac.getCity() + ", " + fac.getState() : null)
                .title(req.getTitle())
                .description(req.getDescription())
                .priority(req.getPriority())
                .status(req.getStatus())
                .slaHours(req.getSlaHours())
                .dueAt(req.getDueAt())
                .resolvedAt(req.getResolvedAt())
                .isOverdue(isOverdue)
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .workOrderId(workOrder.map(WorkOrder::getId).orElse(null))
                .build();
    }
}
