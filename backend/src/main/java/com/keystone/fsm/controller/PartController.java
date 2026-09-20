package com.keystone.fsm.controller;

import com.keystone.fsm.dto.PartDTOs.*;
import com.keystone.fsm.service.PartService;
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
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@Tag(name = "Parts & Inventory", description = "Parts inventory, catalog, and low-stock tracking")
public class PartController {

    private final PartService partService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get all parts in catalog")
    public ResponseEntity<List<PartResponse>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get low stock parts needing reorder")
    public ResponseEntity<List<PartResponse>> getLowStockParts() {
        return ResponseEntity.ok(partService.getLowStockParts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get part by ID")
    public ResponseEntity<PartResponse> getPartById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create new part in inventory")
    public ResponseEntity<PartResponse> createPart(@Valid @RequestBody CreatePartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partService.createPart(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update part inventory details")
    public ResponseEntity<PartResponse> updatePart(@PathVariable Long id, @Valid @RequestBody UpdatePartRequest request) {
        return ResponseEntity.ok(partService.updatePart(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete part from catalog")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
