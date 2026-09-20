package com.keystone.fsm.service;

import com.keystone.fsm.dto.PartDTOs.*;
import com.keystone.fsm.entity.Part;
import com.keystone.fsm.entity.WorkOrder;
import com.keystone.fsm.entity.WorkOrderPart;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.PartRepository;
import com.keystone.fsm.repository.WorkOrderPartRepository;
import com.keystone.fsm.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartService {

    private final PartRepository partRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderPartRepository workOrderPartRepository;

    @Transactional(readOnly = true)
    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PartResponse> getLowStockParts() {
        return partRepository.findLowStockParts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartResponse getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", id));
        return mapToResponse(part);
    }

    @Transactional
    public PartResponse createPart(CreatePartRequest request) {
        if (partRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Part with SKU " + request.getSku() + " already exists");
        }

        Part part = Part.builder()
                .name(request.getName())
                .sku(request.getSku().toUpperCase())
                .description(request.getDescription())
                .unitPrice(request.getUnitPrice())
                .stockQuantity(request.getStockQuantity())
                .reorderLevel(request.getReorderLevel())
                .build();

        return mapToResponse(partRepository.save(part));
    }

    @Transactional
    public PartResponse updatePart(Long id, UpdatePartRequest request) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Part", id));

        if (request.getName() != null) part.setName(request.getName());
        if (request.getSku() != null && !request.getSku().equalsIgnoreCase(part.getSku())) {
            if (partRepository.existsBySku(request.getSku())) {
                throw new IllegalArgumentException("SKU already in use");
            }
            part.setSku(request.getSku().toUpperCase());
        }
        if (request.getDescription() != null) part.setDescription(request.getDescription());
        if (request.getUnitPrice() != null) part.setUnitPrice(request.getUnitPrice());
        if (request.getStockQuantity() != null) part.setStockQuantity(request.getStockQuantity());
        if (request.getReorderLevel() != null) part.setReorderLevel(request.getReorderLevel());

        return mapToResponse(partRepository.save(part));
    }

    @Transactional
    public WorkOrderPartResponse addPartToWorkOrder(Long workOrderId, AddPartUsageRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrder", workOrderId));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Part", request.getPartId()));

        if (part.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient inventory for part: " + part.getName()
                    + ". Available: " + part.getStockQuantity() + ", requested: " + request.getQuantity());
        }

        // Deduct inventory
        part.setStockQuantity(part.getStockQuantity() - request.getQuantity());
        partRepository.save(part);

        WorkOrderPart wop = WorkOrderPart.builder()
                .workOrder(workOrder)
                .part(part)
                .quantityUsed(request.getQuantity())
                .unitPrice(part.getUnitPrice())
                .build();

        WorkOrderPart saved = workOrderPartRepository.save(wop);

        return WorkOrderPartResponse.builder()
                .id(saved.getId())
                .partId(part.getId())
                .partName(part.getName())
                .sku(part.getSku())
                .quantityUsed(saved.getQuantityUsed())
                .unitPrice(saved.getUnitPrice())
                .totalCost(saved.getUnitPrice().multiply(BigDecimal.valueOf(saved.getQuantityUsed())))
                .build();
    }

    @Transactional
    public void removePartFromWorkOrder(Long workOrderId, Long workOrderPartId) {
        WorkOrderPart wop = workOrderPartRepository.findById(workOrderPartId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkOrderPart", workOrderPartId));

        // Restore inventory
        Part part = wop.getPart();
        part.setStockQuantity(part.getStockQuantity() + wop.getQuantityUsed());
        partRepository.save(part);

        workOrderPartRepository.delete(wop);
    }

    @Transactional
    public void deletePart(Long id) {
        if (!partRepository.existsById(id)) {
            throw new ResourceNotFoundException("Part", id);
        }
        partRepository.deleteById(id);
    }

    public PartResponse mapToResponse(Part part) {
        return PartResponse.builder()
                .id(part.getId())
                .name(part.getName())
                .sku(part.getSku())
                .description(part.getDescription())
                .unitPrice(part.getUnitPrice())
                .stockQuantity(part.getStockQuantity())
                .reorderLevel(part.getReorderLevel())
                .isLowStock(part.getStockQuantity() <= part.getReorderLevel())
                .createdAt(part.getCreatedAt())
                .build();
    }
}
