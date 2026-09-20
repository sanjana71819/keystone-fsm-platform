package com.keystone.fsm.config;

import com.keystone.fsm.entity.*;
import com.keystone.fsm.entity.enums.Priority;
import com.keystone.fsm.entity.enums.RequestStatus;
import com.keystone.fsm.entity.enums.Role;
import com.keystone.fsm.entity.enums.WorkOrderStatus;
import com.keystone.fsm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final FacilityRepository facilityRepository;
    private final TechnicianRepository technicianRepository;
    private final PartRepository partRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderPartRepository workOrderPartRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with users. Skipping initial seed.");
            return;
        }

        log.info("Seeding initial Project KEYSTONE database...");

        // 1. Admin & Manager
        userRepository.save(User.builder()
                .username("admin")
                .email("admin@keystone.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .firstName("Alexander")
                .lastName("Keystone")
                .phone("+1 555-0100")
                .enabled(true)
                .build());

        userRepository.save(User.builder()
                .username("manager")
                .email("sarah.connor@keystone.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.MANAGER)
                .firstName("Sarah")
                .lastName("Connor")
                .phone("+1 555-0101")
                .enabled(true)
                .build());

        // 2. Technicians
        User techUser1 = userRepository.save(User.builder()
                .username("tech1")
                .email("marcus.vance@keystone.com")
                .password(passwordEncoder.encode("tech123"))
                .role(Role.TECHNICIAN)
                .firstName("Marcus")
                .lastName("Vance")
                .phone("+1 555-0201")
                .enabled(true)
                .build());

        Technician tech1 = technicianRepository.save(Technician.builder()
                .user(techUser1)
                .skills("HVAC, Electrical Systems, PLC Diagnostics, Industrial Refrigeration")
                .certifications("EPA Universal, NATE Certified, OSHA 30")
                .available(true)
                .notes("Senior field engineer. Specializes in heavy industrial equipment.")
                .build());

        User techUser2 = userRepository.save(User.builder()
                .username("tech2")
                .email("elena.rodriguez@keystone.com")
                .password(passwordEncoder.encode("tech123"))
                .role(Role.TECHNICIAN)
                .firstName("Elena")
                .lastName("Rodriguez")
                .phone("+1 555-0202")
                .enabled(true)
                .build());

        Technician tech2 = technicianRepository.save(Technician.builder()
                .user(techUser2)
                .skills("Pneumatics, Hydraulics, Pump Overhaul, Flow Calibration")
                .certifications("Certified Fluid Power Specialist (CFPS)")
                .available(true)
                .notes("Fast response specialist with mobile tool trailer.")
                .build());

        User techUser3 = userRepository.save(User.builder()
                .username("tech3")
                .email("dmitri.ivanov@keystone.com")
                .password(passwordEncoder.encode("tech123"))
                .role(Role.TECHNICIAN)
                .firstName("Dmitri")
                .lastName("Ivanov")
                .phone("+1 555-0203")
                .enabled(true)
                .build());

        technicianRepository.save(Technician.builder()
                .user(techUser3)
                .skills("Fiber Optics, Sensor Networks, SCADA telemetry, Security Systems")
                .certifications("BICSI Installer 2, CompTIA Network+")
                .available(false)
                .notes("Assigned to on-site remote radar facility.")
                .build());

        // 3. Customers
        User custUser1 = userRepository.save(User.builder()
                .username("customer1")
                .email("operations@apexlogistics.com")
                .password(passwordEncoder.encode("customer123"))
                .role(Role.CUSTOMER)
                .firstName("Rachel")
                .lastName("Green")
                .phone("+1 555-0301")
                .enabled(true)
                .build());

        Customer cust1 = customerRepository.save(Customer.builder()
                .user(custUser1)
                .companyName("Apex Logistics Hub")
                .contactPhone("+1 555-0301")
                .billingAddress("8500 Cargo Way, Dock 4, Chicago, IL 60666")
                .notes("Tier 1 Enterprise SLA Account. 24/7 emergency dispatch coverage.")
                .build());

        User custUser2 = userRepository.save(User.builder()
                .username("customer2")
                .email("facilities@biovanguard.com")
                .password(passwordEncoder.encode("customer123"))
                .role(Role.CUSTOMER)
                .firstName("David")
                .lastName("Chen")
                .phone("+1 555-0302")
                .enabled(true)
                .build());

        Customer cust2 = customerRepository.save(Customer.builder()
                .user(custUser2)
                .companyName("BioVanguard Laboratories")
                .contactPhone("+1 555-0302")
                .billingAddress("420 Innovation Parkway, Cambridge, MA 02142")
                .notes("Cleanroom environment protocol mandatory before entry.")
                .build());

        // 4. Facilities
        Facility fac1 = facilityRepository.save(Facility.builder()
                .customer(cust1)
                .name("Apex Distribution Center Central")
                .address("8500 Cargo Way")
                .city("Chicago")
                .state("IL")
                .zipCode("60666")
                .country("US")
                .contactName("Rachel Green")
                .contactPhone("+1 555-0301")
                .notes("Gate security check-in required. High-voltage subpanel in Sector B.")
                .active(true)
                .build());

        Facility fac2 = facilityRepository.save(Facility.builder()
                .customer(cust1)
                .name("Apex Cold Storage Facility")
                .address("1200 Frost Lane")
                .city("Des Plaines")
                .state("IL")
                .zipCode("60016")
                .country("US")
                .contactName("Tom Miller")
                .contactPhone("+1 555-0305")
                .notes("Sub-zero freezer bays. Thermal suits required.")
                .active(true)
                .build());

        Facility fac3 = facilityRepository.save(Facility.builder()
                .customer(cust2)
                .name("BioVanguard R&D Main Lab")
                .address("420 Innovation Parkway")
                .city("Cambridge")
                .state("MA")
                .zipCode("02142")
                .country("US")
                .contactName("David Chen")
                .contactPhone("+1 555-0302")
                .notes("ISO 5 Cleanroom. PPE and decontamination airlock mandatory.")
                .active(true)
                .build());

        // 5. Parts Inventory
        Part part1 = partRepository.save(Part.builder()
                .name("High-Pressure Hydraulic Seal Kit")
                .sku("PRT-HYD-001")
                .description("Viton elastomer seals rated up to 5,000 PSI")
                .unitPrice(new BigDecimal("145.50"))
                .stockQuantity(24)
                .reorderLevel(8)
                .build());

        partRepository.save(Part.builder()
                .name("Digital Pressure Transducer 0-500 PSI")
                .sku("PRT-SEN-042")
                .description("4-20mA output stainless steel pressure sensor")
                .unitPrice(new BigDecimal("280.00"))
                .stockQuantity(12)
                .reorderLevel(5)
                .build());

        partRepository.save(Part.builder()
                .name("Centrifugal Pump Impeller (Bronze 8\")")
                .sku("PRT-PMP-109")
                .description("Heavy-duty replacement impeller for 3-phase coolant pumps")
                .unitPrice(new BigDecimal("620.00"))
                .stockQuantity(3)
                .reorderLevel(5)
                .build());

        partRepository.save(Part.builder()
                .name("HEPA Cleanroom Filter Cartridge (24x24x12)")
                .sku("PRT-FLT-880")
                .description("99.99% efficiency particulate air filter for ISO labs")
                .unitPrice(new BigDecimal("315.00"))
                .stockQuantity(18)
                .reorderLevel(6)
                .build());

        Part part5 = partRepository.save(Part.builder()
                .name("Contactor Relay 24VDC 40A")
                .sku("PRT-REL-204")
                .description("Industrial DIN-rail mounted 3-pole contactor")
                .unitPrice(new BigDecimal("48.75"))
                .stockQuantity(4)
                .reorderLevel(10)
                .build());

        // 6. Service Requests & Work Orders
        LocalDateTime now = LocalDateTime.now();

        // Request 1: Critical & In Progress
        ServiceRequest sr1 = serviceRequestRepository.save(ServiceRequest.builder()
                .customer(cust1)
                .facility(fac2)
                .title("Cold Storage Unit #3 Compressor Pressure Drop")
                .description("Compressor pressure plummeted below 120 PSI. Temp rising in freezer bay 2. Immediate dispatch required to prevent inventory spoilage.")
                .priority(Priority.CRITICAL)
                .status(RequestStatus.IN_PROGRESS)
                .slaHours(4)
                .dueAt(now.plusHours(2))
                .build());

        WorkOrder wo1 = workOrderRepository.save(WorkOrder.builder()
                .serviceRequest(sr1)
                .technician(tech1)
                .status(WorkOrderStatus.IN_PROGRESS)
                .scheduledAt(now.minusHours(1))
                .startedAt(now.minusMinutes(45))
                .description("Inspect primary coolant circuit, check for refrigerant leak, replace transducer if faulty.")
                .notes("Technician on site. Found minor leak at valve junction. Replacing seal kit and recalibrating.")
                .build());

        workOrderPartRepository.save(WorkOrderPart.builder()
                .workOrder(wo1)
                .part(part1)
                .quantityUsed(2)
                .unitPrice(part1.getUnitPrice())
                .build());

        timeEntryRepository.save(TimeEntry.builder()
                .workOrder(wo1)
                .technician(tech1)
                .clockIn(now.minusMinutes(45))
                .notes("Arrival on site, safety briefing and pressure check.")
                .build());

        // Request 2: High Priority - Open / Overdue test
        ServiceRequest sr2 = serviceRequestRepository.save(ServiceRequest.builder()
                .customer(cust2)
                .facility(fac3)
                .title("Cleanroom Air Flow Velocity Differential Warning")
                .description("Differential pressure sensor in Lab 4 is showing intermittent alarms. Air turnover rate below ISO 5 certification threshold.")
                .priority(Priority.HIGH)
                .status(RequestStatus.OPEN)
                .slaHours(12)
                .dueAt(now.plusHours(6))
                .build());

        workOrderRepository.save(WorkOrder.builder()
                .serviceRequest(sr2)
                .technician(tech2)
                .status(WorkOrderStatus.ASSIGNED)
                .scheduledAt(now.plusHours(2))
                .description("Replace HEPA filtration module and test differential airflow.")
                .notes("Scheduled for Marcus and Elena after morning shift.")
                .build());

        // Request 3: Completed Service Request
        ServiceRequest sr3 = serviceRequestRepository.save(ServiceRequest.builder()
                .customer(cust1)
                .facility(fac1)
                .title("Dock 4 Conveyor Belt Emergency Motor Tripping")
                .description("Conveyor belt #4 motor thermal overload tripping during peak loading hours.")
                .priority(Priority.MEDIUM)
                .status(RequestStatus.RESOLVED)
                .slaHours(24)
                .dueAt(now.minusDays(1))
                .resolvedAt(now.minusHours(4))
                .build());

        WorkOrder wo3 = workOrderRepository.save(WorkOrder.builder()
                .serviceRequest(sr3)
                .technician(tech2)
                .status(WorkOrderStatus.COMPLETED)
                .scheduledAt(now.minusDays(1))
                .startedAt(now.minusHours(8))
                .completedAt(now.minusHours(4))
                .description("Check electrical contactor and inspect gearbox bearing wear.")
                .notes("Replaced faulty contactor relay. Tested conveyor under full load for 60 minutes with zero faults.")
                .build());

        workOrderPartRepository.save(WorkOrderPart.builder()
                .workOrder(wo3)
                .part(part5)
                .quantityUsed(1)
                .unitPrice(part5.getUnitPrice())
                .build());

        timeEntryRepository.save(TimeEntry.builder()
                .workOrder(wo3)
                .technician(tech2)
                .clockIn(now.minusHours(8))
                .clockOut(now.minusHours(4))
                .notes("Full diagnostics, relay replacement, and stress test.")
                .build());

        log.info("Project KEYSTONE initial seed completed successfully!");
    }
}
