package com.keystone.fsm.repository;

import com.keystone.fsm.entity.WorkOrder;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByTechnicianId(Long technicianId);
    List<WorkOrder> findByStatus(WorkOrderStatus status);
    Optional<WorkOrder> findByServiceRequestId(Long serviceRequestId);
    List<WorkOrder> findByServiceRequestCustomerId(Long customerId);
    
    long countByStatus(WorkOrderStatus status);
    long countByTechnicianIdAndStatusIn(Long technicianId, List<WorkOrderStatus> statuses);
    long countByTechnicianIdAndStatus(Long technicianId, WorkOrderStatus status);

    @Query("SELECT wo FROM WorkOrder wo WHERE wo.technician.id = :techId ORDER BY wo.createdAt DESC")
    List<WorkOrder> findByTechnicianIdOrderByCreatedAtDesc(@Param("techId") Long technicianId);

    List<WorkOrder> findTop10ByOrderByCreatedAtDesc();
}
