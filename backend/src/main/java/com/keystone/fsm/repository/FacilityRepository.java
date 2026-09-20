package com.keystone.fsm.repository;

import com.keystone.fsm.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByCustomerId(Long customerId);
    List<Facility> findByCustomerIdAndActiveTrue(Long customerId);
    long countByCustomerId(Long customerId);
}
