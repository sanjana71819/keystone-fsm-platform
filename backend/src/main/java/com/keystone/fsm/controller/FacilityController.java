package com.keystone.fsm.controller;

import com.keystone.fsm.dto.FacilityDTOs.*;
import com.keystone.fsm.service.FacilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
@Tag(name = "Facilities", description = "Facility and site management endpoints")
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get all facilities")
    public ResponseEntity<List<FacilityResponse>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get facilities by customer ID")
    public ResponseEntity<List<FacilityResponse>> getFacilitiesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(facilityService.getFacilitiesByCustomer(customerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get facility by ID")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CUSTOMER')")
    @Operation(summary = "Create facility")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody CreateFacilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update facility")
    public ResponseEntity<FacilityResponse> updateFacility(@PathVariable Long id, @Valid @RequestBody UpdateFacilityRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete facility (Admin only)")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}
