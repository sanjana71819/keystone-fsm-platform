package com.keystone.fsm.controller;

import com.keystone.fsm.dto.ServiceRequestDTOs.*;
import com.keystone.fsm.service.ServiceRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
@Tag(name = "Service Requests", description = "Service request management, ticketing, and SLA tracking")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get all service requests")
    public ResponseEntity<List<ServiceRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllRequests());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get service requests by customer")
    public ResponseEntity<List<ServiceRequestResponse>> getRequestsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(serviceRequestService.getRequestsByCustomer(customerId));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all overdue service requests exceeding SLA")
    public ResponseEntity<List<ServiceRequestResponse>> getOverdueRequests() {
        return ResponseEntity.ok(serviceRequestService.getOverdueRequests());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get service request by ID")
    public ResponseEntity<ServiceRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getRequestById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER')")
    @Operation(summary = "Create a new service request")
    public ResponseEntity<ServiceRequestResponse> createRequest(
            @Valid @RequestBody CreateServiceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceRequestService.createRequest(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Update service request details or status")
    public ResponseEntity<ServiceRequestResponse> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequest request) {
        return ResponseEntity.ok(serviceRequestService.updateRequest(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete service request")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        serviceRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
