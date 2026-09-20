package com.keystone.fsm.controller;

import com.keystone.fsm.dto.PartDTOs;
import com.keystone.fsm.dto.WorkOrderDTOs.*;
import com.keystone.fsm.service.PartService;
import com.keystone.fsm.service.WorkOrderService;
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
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
@Tag(name = "Work Orders", description = "Work order lifecycle, dispatch, and assignment management")
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final PartService partService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get all work orders")
    public ResponseEntity<List<WorkOrderResponse>> getAllWorkOrders() {
        return ResponseEntity.ok(workOrderService.getAllWorkOrders());
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get work orders assigned to a technician")
    public ResponseEntity<List<WorkOrderResponse>> getWorkOrdersByTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByTechnician(technicianId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get work orders for a customer")
    public ResponseEntity<List<WorkOrderResponse>> getWorkOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(workOrderService.getWorkOrdersByCustomer(customerId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER')")
    @Operation(summary = "Get work order details by ID")
    public ResponseEntity<WorkOrderResponse> getWorkOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create work order")
    public ResponseEntity<WorkOrderResponse> createWorkOrder(@Valid @RequestBody CreateWorkOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workOrderService.createWorkOrder(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update work order")
    public ResponseEntity<WorkOrderResponse> updateWorkOrder(@PathVariable Long id, @Valid @RequestBody UpdateWorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, request));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Dispatch / assign technician to work order")
    public ResponseEntity<WorkOrderResponse> assignTechnician(@PathVariable Long id, @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(workOrderService.assignTechnician(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Update work order lifecycle status (OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED)")
    public ResponseEntity<WorkOrderResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(workOrderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Add parts used to work order")
    public ResponseEntity<PartDTOs.WorkOrderPartResponse> addPart(
            @PathVariable Long id,
            @Valid @RequestBody PartDTOs.AddPartUsageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partService.addPartToWorkOrder(id, request));
    }

    @DeleteMapping("/{id}/parts/{partUsageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Remove part used from work order")
    public ResponseEntity<Void> removePart(@PathVariable Long id, @PathVariable Long partUsageId) {
        partService.removePartFromWorkOrder(id, partUsageId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete work order")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.noContent().build();
    }
}
