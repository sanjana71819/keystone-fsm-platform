package com.keystone.fsm.repository;

import com.keystone.fsm.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
    Optional<Technician> findByUserUsername(String username);
    List<Technician> findByAvailableTrue();
    long countByAvailableTrue();
}
