package com.keystone.fsm.service;

import com.keystone.fsm.dto.TechnicianDTOs.*;
import com.keystone.fsm.entity.Technician;
import com.keystone.fsm.entity.User;
import com.keystone.fsm.entity.enums.Role;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.TechnicianRepository;
import com.keystone.fsm.repository.UserRepository;
import com.keystone.fsm.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAllTechnicians() {
        return technicianRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAvailableTechnicians() {
        return technicianRepository.findByAvailableTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getTechnicianById(Long id) {
        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", id));
        return mapToResponse(tech);
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getTechnicianByUserId(Long userId) {
        Technician tech = technicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician profile not found for user: " + userId));
        return mapToResponse(tech);
    }

    @Transactional
    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        } else {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }

            user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(StringUtils.hasText(request.getPassword()) ? request.getPassword() : "tech123"))
                    .role(Role.TECHNICIAN)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .enabled(true)
                    .build();
            user = userRepository.save(user);
        }

        Technician technician = Technician.builder()
                .user(user)
                .skills(request.getSkills())
                .certifications(request.getCertifications())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .notes(request.getNotes())
                .build();

        return mapToResponse(technicianRepository.save(technician));
    }

    @Transactional
    public TechnicianResponse updateTechnician(Long id, UpdateTechnicianRequest request) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", id));

        if (request.getSkills() != null) technician.setSkills(request.getSkills());
        if (request.getCertifications() != null) technician.setCertifications(request.getCertifications());
        if (request.getAvailable() != null) technician.setAvailable(request.getAvailable());
        if (request.getNotes() != null) technician.setNotes(request.getNotes());

        User user = technician.getUser();
        if (user != null) {
            if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
            if (request.getLastName() != null) user.setLastName(request.getLastName());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getEmail() != null) user.setEmail(request.getEmail());
            userRepository.save(user);
        }

        return mapToResponse(technicianRepository.save(technician));
    }

    @Transactional
    public void deleteTechnician(Long id) {
        if (!technicianRepository.existsById(id)) {
            throw new ResourceNotFoundException("Technician", id);
        }
        technicianRepository.deleteById(id);
    }

    public TechnicianResponse mapToResponse(Technician tech) {
        long activeOrders = workOrderRepository.countByTechnicianIdAndStatusIn(
                tech.getId(), List.of(WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS));
        User user = tech.getUser();
        return TechnicianResponse.builder()
                .id(tech.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .phone(user != null ? user.getPhone() : null)
                .skills(tech.getSkills())
                .certifications(tech.getCertifications())
                .available(tech.getAvailable())
                .notes(tech.getNotes())
                .createdAt(tech.getCreatedAt())
                .activeWorkOrdersCount(activeOrders)
                .build();
    }
}
