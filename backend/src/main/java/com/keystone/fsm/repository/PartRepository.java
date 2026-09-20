package com.keystone.fsm.repository;

import com.keystone.fsm.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findBySku(String sku);
    Boolean existsBySku(String sku);

    @Query("SELECT p FROM Part p WHERE p.stockQuantity <= p.reorderLevel")
    List<Part> findLowStockParts();

    @Query("SELECT COUNT(p) FROM Part p WHERE p.stockQuantity <= p.reorderLevel")
    long countLowStockParts();
}
