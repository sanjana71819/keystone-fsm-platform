package com.keystone.fsm.controller;

import com.keystone.fsm.dto.TechnicianDTOs.*;
import com.keystone.fsm.service.TechnicianService;
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
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
@Tag(name = "Technicians", description = "Technician profiles and availability endpoints")
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get all technicians")
    public ResponseEntity<List<TechnicianResponse>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get available technicians for dispatch")
    public ResponseEntity<List<TechnicianResponse>> getAvailableTechnicians() {
        return ResponseEntity.ok(technicianService.getAvailableTechnicians());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get technician by ID")
    public ResponseEntity<TechnicianResponse> getTechnicianById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get technician by user ID")
    public ResponseEntity<TechnicianResponse> getTechnicianByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(technicianService.getTechnicianByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create technician profile")
    public ResponseEntity<TechnicianResponse> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.createTechnician(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Update technician profile/availability")
    public ResponseEntity<TechnicianResponse> updateTechnician(@PathVariable Long id, @Valid @RequestBody UpdateTechnicianRequest request) {
        return ResponseEntity.ok(technicianService.updateTechnician(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete technician profile")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }
}
