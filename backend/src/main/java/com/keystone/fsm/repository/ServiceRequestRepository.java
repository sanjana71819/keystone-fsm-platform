package com.keystone.fsm.repository;

import com.keystone.fsm.entity.ServiceRequest;
import com.keystone.fsm.entity.enums.Priority;
import com.keystone.fsm.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerId(Long customerId);
    List<ServiceRequest> findByStatus(RequestStatus status);
    List<ServiceRequest> findByPriority(Priority priority);
    
    long countByStatus(RequestStatus status);
    long countByPriority(Priority priority);

    @Query("SELECT COUNT(s) FROM ServiceRequest s WHERE s.dueAt < :now AND s.status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')")
    long countOverdueRequests(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM ServiceRequest s WHERE s.dueAt < :now AND s.status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED')")
    List<ServiceRequest> findOverdueRequests(@Param("now") LocalDateTime now);

    List<ServiceRequest> findTop10ByOrderByCreatedAtDesc();
}
