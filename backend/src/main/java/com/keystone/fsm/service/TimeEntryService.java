package com.keystone.fsm.service;

import com.keystone.fsm.dto.TimeEntryDTOs.*;
import com.keystone.fsm.entity.Technician;
import com.keystone.fsm.entity.TimeEntry;
import com.keystone.fsm.entity.User;
import com.keystone.fsm.entity.WorkOrder;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.TechnicianRepository;
import com.keystone.fsm.repository.TimeEntryRepository;
import com.keystone.fsm.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final WorkOrderRepository workOrderRepository;
    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getAllTimeEntries() {
        return timeEntryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getTimeEntriesByWorkOrder(Long workOrderId) {
        return timeEntryRepository.findByWorkOrderId(workOrderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimeEntryResponse> getTimeEntriesByTechnician(Long technicianId) {
        return timeEntryRepository.findByTechnicianId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<TimeEntryResponse> getActiveClockIn(Long technicianId) {
        return timeEntryRepository.findActiveTimeEntryByTechnicianId(technicianId)
                .map(this::mapToResponse);
    }

    @Transactional
    public TimeEntryResponse clockIn(ClockInRequest request, String currentUsername) {
        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", request.getWorkOrderId()));

        Technician technician;
        if (request.getTechnicianId() != null) {
            technician = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", request.getTechnicianId()));
        } else {
            technician = technicianRepository.findByUserUsername(currentUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Technician profile not found for user: " + currentUsername));
        }

        // Check if technician already has an active clock-in
        Optional<TimeEntry> existing = timeEntryRepository.findActiveTimeEntryByTechnicianId(technician.getId());
        if (existing.isPresent()) {
            throw new IllegalStateException("Technician already has an active clock-in for Work Order #"
                    + existing.get().getWorkOrder().getId());
        }

        TimeEntry entry = TimeEntry.builder()
                .workOrder(workOrder)
                .technician(technician)
                .clockIn(LocalDateTime.now())
                .notes(request.getNotes())
                .build();

        // If work order is not already in progress, start it
        if (workOrder.getStatus() == WorkOrderStatus.OPEN || workOrder.getStatus() == WorkOrderStatus.ASSIGNED) {
            workOrder.setStatus(WorkOrderStatus.IN_PROGRESS);
            if (workOrder.getStartedAt() == null) {
                workOrder.setStartedAt(LocalDateTime.now());
            }
            workOrderRepository.save(workOrder);
        }

        return mapToResponse(timeEntryRepository.save(entry));
    }

    @Transactional
    public TimeEntryResponse clockOut(Long entryId, ClockOutRequest request) {
        TimeEntry entry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeEntry", entryId));

        if (entry.getClockOut() != null) {
            throw new IllegalStateException("Time entry is already clocked out");
        }

        entry.setClockOut(LocalDateTime.now());
        if (request != null && request.getNotes() != null) {
            String existingNotes = entry.getNotes() != null ? entry.getNotes() + " | " : "";
            entry.setNotes(existingNotes + request.getNotes());
        }

        return mapToResponse(timeEntryRepository.save(entry));
    }

    @Transactional
    public TimeEntryResponse createManualTimeEntry(CreateTimeEntryRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", request.getWorkOrderId()));

        Technician technician = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician", request.getTechnicianId()));

        TimeEntry entry = TimeEntry.builder()
                .workOrder(workOrder)
                .technician(technician)
                .clockIn(request.getClockIn())
                .clockOut(request.getClockOut())
                .notes(request.getNotes())
                .build();

        return mapToResponse(timeEntryRepository.save(entry));
    }

    @Transactional
    public void deleteTimeEntry(Long id) {
        if (!timeEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("TimeEntry", id);
        }
        timeEntryRepository.deleteById(id);
    }

    public TimeEntryResponse mapToResponse(TimeEntry entry) {
        Double durationHours = null;
        if (entry.getClockIn() != null && entry.getClockOut() != null) {
            double minutes = Duration.between(entry.getClockIn(), entry.getClockOut()).toMinutes();
            durationHours = Math.round((minutes / 60.0) * 100.0) / 100.0;
        }

        Technician tech = entry.getTechnician();
        User techUser = tech != null ? tech.getUser() : null;

        return TimeEntryResponse.builder()
                .id(entry.getId())
                .workOrderId(entry.getWorkOrder() != null ? entry.getWorkOrder().getId() : null)
                .technicianId(tech != null ? tech.getId() : null)
                .technicianName(techUser != null ? techUser.getFirstName() + " " + techUser.getLastName() : "Unknown")
                .clockIn(entry.getClockIn())
                .clockOut(entry.getClockOut())
                .durationHours(durationHours)
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
