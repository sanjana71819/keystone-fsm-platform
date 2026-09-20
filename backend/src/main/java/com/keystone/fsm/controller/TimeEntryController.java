package com.keystone.fsm.controller;

import com.keystone.fsm.dto.TimeEntryDTOs.*;
import com.keystone.fsm.service.TimeEntryService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/time-entries")
@RequiredArgsConstructor
@Tag(name = "Time Tracking", description = "Technician time tracking, clock-in, and clock-out logs")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get all time entries")
    public ResponseEntity<List<TimeEntryResponse>> getAllTimeEntries() {
        return ResponseEntity.ok(timeEntryService.getAllTimeEntries());
    }

    @GetMapping("/work-order/{workOrderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get time entries for a work order")
    public ResponseEntity<List<TimeEntryResponse>> getTimeEntriesByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(timeEntryService.getTimeEntriesByWorkOrder(workOrderId));
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get time entries logged by a technician")
    public ResponseEntity<List<TimeEntryResponse>> getTimeEntriesByTechnician(@PathVariable Long technicianId) {
        return ResponseEntity.ok(timeEntryService.getTimeEntriesByTechnician(technicianId));
    }

    @GetMapping("/active/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Get current active clock-in for technician")
    public ResponseEntity<TimeEntryResponse> getActiveClockIn(@PathVariable Long technicianId) {
        Optional<TimeEntryResponse> active = timeEntryService.getActiveClockIn(technicianId);
        return active.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/clock-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Clock in to a work order")
    public ResponseEntity<TimeEntryResponse> clockIn(
            @Valid @RequestBody ClockInRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timeEntryService.clockIn(request, userDetails.getUsername()));
    }

    @PostMapping("/{id}/clock-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    @Operation(summary = "Clock out of a work order")
    public ResponseEntity<TimeEntryResponse> clockOut(
            @PathVariable Long id,
            @RequestBody(required = false) ClockOutRequest request) {
        return ResponseEntity.ok(timeEntryService.clockOut(id, request));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Manually create a time entry (Admin/Manager only)")
    public ResponseEntity<TimeEntryResponse> createManual(@Valid @RequestBody CreateTimeEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeEntryService.createManualTimeEntry(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete time entry")
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable Long id) {
        timeEntryService.deleteTimeEntry(id);
        return ResponseEntity.noContent().build();
    }
}
