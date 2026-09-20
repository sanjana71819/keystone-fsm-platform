package com.keystone.fsm.service;

import com.keystone.fsm.dto.FacilityDTOs.*;
import com.keystone.fsm.entity.Customer;
import com.keystone.fsm.entity.Facility;
import com.keystone.fsm.exception.ResourceNotFoundException;
import com.keystone.fsm.repository.CustomerRepository;
import com.keystone.fsm.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FacilityResponse> getFacilitiesByCustomer(Long customerId) {
        return facilityRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FacilityResponse getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", id));
        return mapToResponse(facility);
    }

    @Transactional
    public FacilityResponse createFacility(CreateFacilityRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        Facility facility = Facility.builder()
                .customer(customer)
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry() != null ? request.getCountry() : "US")
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .notes(request.getNotes())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return mapToResponse(facilityRepository.save(facility));
    }

    @Transactional
    public FacilityResponse updateFacility(Long id, UpdateFacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", id));

        if (request.getName() != null) facility.setName(request.getName());
        if (request.getAddress() != null) facility.setAddress(request.getAddress());
        if (request.getCity() != null) facility.setCity(request.getCity());
        if (request.getState() != null) facility.setState(request.getState());
        if (request.getZipCode() != null) facility.setZipCode(request.getZipCode());
        if (request.getCountry() != null) facility.setCountry(request.getCountry());
        if (request.getContactName() != null) facility.setContactName(request.getContactName());
        if (request.getContactPhone() != null) facility.setContactPhone(request.getContactPhone());
        if (request.getNotes() != null) facility.setNotes(request.getNotes());
        if (request.getActive() != null) facility.setActive(request.getActive());

        return mapToResponse(facilityRepository.save(facility));
    }

    @Transactional
    public void deleteFacility(Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facility", id);
        }
        facilityRepository.deleteById(id);
    }

    public FacilityResponse mapToResponse(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .customerId(facility.getCustomer().getId())
                .customerCompanyName(facility.getCustomer().getCompanyName())
                .name(facility.getName())
                .address(facility.getAddress())
                .city(facility.getCity())
                .state(facility.getState())
                .zipCode(facility.getZipCode())
                .country(facility.getCountry())
                .contactName(facility.getContactName())
                .contactPhone(facility.getContactPhone())
                .notes(facility.getNotes())
                .active(facility.getActive())
                .createdAt(facility.getCreatedAt())
                .build();
    }
}
