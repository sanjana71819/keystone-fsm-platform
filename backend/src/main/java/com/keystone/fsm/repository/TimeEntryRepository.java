package com.keystone.fsm.repository;

import com.keystone.fsm.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findByWorkOrderId(Long workOrderId);
    List<TimeEntry> findByTechnicianId(Long technicianId);
    
    @Query("SELECT te FROM TimeEntry te WHERE te.technician.id = :technicianId AND te.clockOut IS NULL")
    Optional<TimeEntry> findActiveTimeEntryByTechnicianId(@Param("technicianId") Long technicianId);

    @Query("SELECT te FROM TimeEntry te WHERE te.workOrder.id = :workOrderId AND te.clockOut IS NULL")
    List<TimeEntry> findActiveTimeEntriesByWorkOrderId(@Param("workOrderId") Long workOrderId);

    List<TimeEntry> findTop10ByOrderByCreatedAtDesc();
}
