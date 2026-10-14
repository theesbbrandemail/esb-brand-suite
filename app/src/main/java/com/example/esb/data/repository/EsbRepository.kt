package com.example.esb.data.repository

import com.example.esb.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class EsbRepository {

    val branches = listOf(
        Branch(
            id = "branch-ph",
            name = "Port Harcourt",
            city = "Port Harcourt",
            phone = "+234 803 123 4567",
            address = "14 Stadium Road, GRA Phase 4, Port Harcourt",
            whatsapp = "+2348031234567"
        ),
        Branch(
            id = "branch-abj",
            name = "Abuja",
            city = "Abuja",
            phone = "+234 809 765 4321",
            address = "22 Aminu Kano Crescent, Wuse II, Abuja",
            whatsapp = "+2348097654321"
        )
    )

    private val _selectedBranchId = MutableStateFlow("branch-ph")
    val selectedBranchId: StateFlow<String> = _selectedBranchId.asStateFlow()

    private val _appointments = MutableStateFlow<List<Appointment>>(emptyList())
    val appointments: StateFlow<List<Appointment>> = _appointments.asStateFlow()

    private val _followUps = MutableStateFlow<List<FollowUp>>(emptyList())
    val followUps: StateFlow<List<FollowUp>> = _followUps.asStateFlow()

    private val _inventory = MutableStateFlow<List<InventoryItem>>(emptyList())
    val inventory: StateFlow<List<InventoryItem>> = _inventory.asStateFlow()

    private val _automationTasks = MutableStateFlow<List<AutomationTask>>(emptyList())
    val automationTasks: StateFlow<List<AutomationTask>> = _automationTasks.asStateFlow()

    private val _subBrands = MutableStateFlow<List<SubBrand>>(emptyList())
    val subBrands: StateFlow<List<SubBrand>> = _subBrands.asStateFlow()

    private val _customers = MutableStateFlow<List<Customer>>(emptyList())
    val customers: StateFlow<List<Customer>> = _customers.asStateFlow()

    // CRM 360 Patients
    private val _crmPatients = MutableStateFlow<List<CrmPatient>>(emptyList())
    val crmPatients: StateFlow<List<CrmPatient>> = _crmPatients.asStateFlow()

    // Sales Department Dashboards
    private val _salesMetrics = MutableStateFlow<List<SalesDepartmentMetric>>(emptyList())
    val salesMetrics: StateFlow<List<SalesDepartmentMetric>> = _salesMetrics.asStateFlow()

    private val _salesLeads = MutableStateFlow<List<SalesLead>>(emptyList())
    val salesLeads: StateFlow<List<SalesLead>> = _salesLeads.asStateFlow()

    // Doctor & Nurse Dashboards
    private val _doctorCases = MutableStateFlow<List<DoctorCase>>(emptyList())
    val doctorCases: StateFlow<List<DoctorCase>> = _doctorCases.asStateFlow()

    private val _nurseProcedures = MutableStateFlow<List<NurseProcedure>>(emptyList())
    val nurseProcedures: StateFlow<List<NurseProcedure>> = _nurseProcedures.asStateFlow()

    // Enhanced Manager Dashboard State
    private val _staffShifts = MutableStateFlow<List<StaffShift>>(emptyList())
    val staffShifts: StateFlow<List<StaffShift>> = _staffShifts.asStateFlow()

    private val _managerReminders = MutableStateFlow<List<ManagerReminder>>(emptyList())
    val managerReminders: StateFlow<List<ManagerReminder>> = _managerReminders.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

        _appointments.value = listOf(
            Appointment(
                id = "apt-1",
                branchId = "branch-ph",
                patientName = "Dr. Amara Okonjo",
                patientPhone = "+234 802 334 1122",
                patientEmail = "amara.okonjo@gmail.com",
                service = "Hydra-Glow Facial & Skin AI",
                department = "Derma Aesthetics",
                scheduledAt = "$today 09:30 AM",
                durationMinutes = 60,
                status = "confirmed",
                price = 180.0,
                cost = 45.0,
                doctorOrNurse = "Dr. Amara Okonjo",
                room = "Suite A",
                notes = "Pre-event VIP treatment, sensitive T-zone."
            ),
            Appointment(
                id = "apt-2",
                branchId = "branch-ph",
                patientName = "Chinedu Eke",
                patientPhone = "+234 818 998 7766",
                patientEmail = "c.eke@investcorp.ng",
                service = "Blemish Purifying Peel",
                department = "Derma Aesthetics",
                scheduledAt = "$today 11:00 AM",
                durationMinutes = 45,
                status = "scheduled",
                price = 140.0,
                cost = 30.0,
                doctorOrNurse = "Nurse Kemi Adeleke",
                room = "Room 2",
                notes = "Second session in 4-part treatment course."
            )
        )

        // CRM 360 Full Patients Dataset
        _crmPatients.value = listOf(
            CrmPatient(
                id = "crm-1",
                name = "Dr. Amara Okonjo",
                phone = "+234 802 334 1122",
                email = "amara.okonjo@gmail.com",
                tier = "VIP Diamond",
                lifetimeSpend = 4250.0,
                visitsCount = 18,
                skinType = "Combination / Sensitive / Mild Erythema",
                primaryBranch = "Port Harcourt",
                allergies = "Strong Salicylic Acid, Fragrance oils",
                loyaltyPoints = 1450,
                lastVisit = "2026-10-04",
                nextAppointment = "$today 09:30 AM",
                tags = listOf("VIP Diamond", "Prefers WhatsApp", "Hydra-Glow Regular", "High Spender"),
                notes = listOf(
                    CrmNote("n-1", "Nurse Kemi", "2026-10-04", "Loved the cooling compressor in Suite A. Recommended SPF 50 reapplication."),
                    CrmNote("n-2", "Dr. Eze", "2026-09-12", "Cleared for glycolic 20% peeling course.")
                ),
                treatmentHistory = listOf(
                    CrmTreatmentRecord("tr-1", "2026-10-04", "Hydra-Glow Facial & Skin AI", "Dr. Eze", 180.0),
                    CrmTreatmentRecord("tr-2", "2026-09-12", "Custom Serum Bar Formulation", "Esthetician Chioma", 95.0),
                    CrmTreatmentRecord("tr-3", "2026-08-15", "Mineral SPF 50+ & Cleanser Retail", "Blessing Okon", 84.0)
                )
            ),
            CrmPatient(
                id = "crm-2",
                name = "Senator Fatima Aliyu",
                phone = "+234 809 111 8899",
                email = "f.aliyu@gov.ng",
                tier = "VIP Diamond",
                lifetimeSpend = 7890.0,
                visitsCount = 24,
                skinType = "Mature / Hydration Deficiency",
                primaryBranch = "Abuja",
                allergies = "None reported",
                loyaltyPoints = 2800,
                lastVisit = "2026-09-28",
                nextAppointment = "$today 10:00 AM",
                tags = listOf("VIP Diamond", "Private Suite Only", "Exosome Protocol", "Diplomat"),
                notes = listOf(
                    CrmNote("n-3", "Dr. Tariq", "2026-09-28", "Reserved VIP suite 30 minutes in advance with herbal tea preference.")
                ),
                treatmentHistory = listOf(
                    CrmTreatmentRecord("tr-4", "2026-09-28", "Executive Collagen Renewal + RF", "Dr. Ngozi Eze", 320.0),
                    CrmTreatmentRecord("tr-5", "2026-08-30", "Laser Porcelain Whitening", "Dr. Tariq Bello", 280.0)
                )
            ),
            CrmPatient(
                id = "crm-3",
                name = "Chinedu Eke",
                phone = "+234 818 998 7766",
                email = "c.eke@investcorp.ng",
                tier = "Gold Elite",
                lifetimeSpend = 1820.0,
                visitsCount = 8,
                skinType = "Oily / Blemish Prone",
                primaryBranch = "Port Harcourt",
                allergies = "Benzoyl Peroxide sensitivity",
                loyaltyPoints = 620,
                lastVisit = "2026-09-20",
                nextAppointment = "$today 11:00 AM",
                tags = listOf("Gold Elite", "Blemish Course", "Corporate"),
                notes = listOf(
                    CrmNote("n-4", "Nurse Kemi", "2026-09-20", "Completed session 1 of purifying peel. Skin tolerance optimal.")
                ),
                treatmentHistory = listOf(
                    CrmTreatmentRecord("tr-6", "2026-09-20", "Purifying Glycolic Peel #1", "Nurse Kemi", 140.0)
                )
            ),
            CrmPatient(
                id = "crm-4",
                name = "Zainab Bello",
                phone = "+234 701 554 9900",
                email = "zainab.b@luxuryliving.com",
                tier = "Gold Elite",
                lifetimeSpend = 2100.0,
                visitsCount = 9,
                skinType = "Normal / Dehydrated Cheeks",
                primaryBranch = "Port Harcourt",
                allergies = "None",
                loyaltyPoints = 750,
                lastVisit = "2026-10-01",
                nextAppointment = "$today 02:00 PM",
                tags = listOf("Gold Elite", "Serum Bar Aficionado"),
                notes = listOf(
                    CrmNote("n-5", "Esthetician Chioma", "2026-10-01", "Prefers custom peptide blend with floral scent notes.")
                ),
                treatmentHistory = listOf(
                    CrmTreatmentRecord("tr-7", "2026-10-01", "Serum Bar Custom Mixing", "Chioma", 95.0)
                )
            ),
            CrmPatient(
                id = "crm-5",
                name = "Folake Adebayo",
                phone = "+234 803 667 8822",
                email = "folake@designstudio.ng",
                tier = "Member",
                lifetimeSpend = 940.0,
                visitsCount = 5,
                skinType = "Normal / Hyperpigmentation",
                primaryBranch = "Abuja",
                allergies = "None",
                loyaltyPoints = 320,
                lastVisit = "2026-09-18",
                nextAppointment = null,
                tags = listOf("Member", "Vitamin C Fan"),
                notes = listOf(
                    CrmNote("n-6", "Front Desk", "2026-09-18", "Purchased Vitamin C Infusion package.")
                ),
                treatmentHistory = listOf(
                    CrmTreatmentRecord("tr-8", "2026-09-18", "Brightening Vitamin C Infusion", "Cynthia", 135.0)
                )
            )
        )

        // Customer Follow-ups across all 4 departments
        _followUps.value = listOf(
            FollowUp(
                id = "flw-sk-1",
                appointmentId = "apt-3",
                patientName = "Zainab Bello",
                patientPhone = "+2347015549900",
                department = "Skincare Kitchen",
                service = "Custom Serum Bar Blend",
                message = "Hello Zainab! How is your custom Niacinamide + Peptide blend absorbing? We recommend applying 3 drops on damp skin mornings and evenings. Let us know if you need hydration tweaks!",
                status = "pending",
                scheduledDate = "Today 5:00 PM",
                daysPostTreatment = 3,
                priority = "Normal"
            ),
            FollowUp(
                id = "flw-da-1",
                appointmentId = "apt-1",
                patientName = "Dr. Amara Okonjo",
                patientPhone = "+2348023341122",
                department = "Derma Aesthetics",
                service = "Hydra-Glow Facial & Peel",
                message = "Good evening Dr. Amara! Day 1 post Hydra-Glow check-in: any tightness or mild pinkness? Please avoid retinoids for 48 hours and re-apply ESB Mineral SPF 50+ generously.",
                status = "pending",
                scheduledDate = "Today 6:30 PM",
                daysPostTreatment = 1,
                priority = "High"
            ),
            FollowUp(
                id = "flw-ea-1",
                appointmentId = "apt-6",
                patientName = "Kelechi Nwachukwu",
                patientPhone = "+2348124439988",
                department = "ESB Apothecary",
                service = "Barrier Repair Protocol",
                message = "Hi Kelechi, checking in on your prescription Bio-Retinol elixir tolerance. Are you noticing improved moisture retention? Your next review slot is available next Tuesday.",
                status = "pending",
                scheduledDate = "Tomorrow 11:00 AM",
                daysPostTreatment = 7,
                priority = "Normal"
            ),
            FollowUp(
                id = "flw-dt-1",
                appointmentId = "apt-4",
                patientName = "Tariq Briggs",
                patientPhone = "+2348057712233",
                department = "Dental",
                service = "Porcelain Laser Whitening",
                message = "Hello Tariq! Post-whitening check: any transient tooth sensitivity to cold liquids? Avoid dark coffee, red wine or turmeric for 48 hours to preserve peak shade brightness.",
                status = "pending",
                scheduledDate = "Today 7:00 PM",
                daysPostTreatment = 1,
                priority = "High"
            )
        )

        _inventory.value = listOf(
            InventoryItem("inv-1", "branch-ph", "Niacinamide 10% + Zinc 1%", "SK-NIA-10", "Skincare Kitchen", "Serum", 8, 15, 38.0),
            InventoryItem("inv-2", "branch-ph", "Triple Hyaluronic Acid B5", "SK-HA-B5", "Skincare Kitchen", "Serum", 42, 20, 45.0),
            InventoryItem("inv-3", "branch-ph", "Gentle Foaming Ceramide Cleanser", "DA-CLN-01", "Derma Aesthetics", "Cleanser", 12, 15, 32.0),
            InventoryItem("inv-4", "branch-ph", "Invisible Shield Mineral SPF 50+", "EA-SPF-50", "ESB Apothecary", "SPF", 28, 15, 52.0)
        )

        _salesMetrics.value = listOf(
            SalesDepartmentMetric("Skincare Kitchen", 120000.0, 112400.0, 142, 98, 69, 68.5, listOf("Blessing Okon", "Tolu Davies"), "Serum Bar custom mixes drove 42% of revenue."),
            SalesDepartmentMetric("Derma Aesthetics", 95000.0, 88100.0, 84, 52, 62, 195.0, listOf("Kemi Adeleke", "Emeka Obi"), "Collagen Renewal packages up +28% this month."),
            SalesDepartmentMetric("ESB Apothecary", 50000.0, 45300.0, 56, 38, 68, 142.0, listOf("Dr. Ngozi Eze", "Grace Udoh"), "Barrier repair bundles sold out at Port Harcourt clinic."),
            SalesDepartmentMetric("Dental Studio", 60000.0, 54200.0, 34, 22, 65, 340.0, listOf("Dr. Tariq Bello", "Zubaida Ali"), "Laser whitening packages and aligner consults exceeded targets.")
        )

        _salesLeads.value = listOf(
            SalesLead("lead-1", "Chief Arthur Nnamdi", "+234 803 999 1100", "Derma Aesthetics", "Proposal Sent", 1850.0, "Kemi Adeleke", "Annual Executive Skin Rejuvenation VIP Package (12 sessions)."),
            SalesLead("lead-2", "Mrs. Halima Dangote", "+234 809 333 4455", "Dental Studio", "Consultation Scheduled", 3200.0, "Dr. Tariq Bello", "Full arch porcelain veneer makeover consultation.")
        )

        _doctorCases.value = listOf(
            DoctorCase("doc-1", "Dr. Amara Okonjo", 34, "Derma Aesthetics", 82, "Mild T-Zone Erythema", listOf("No oral retinoids"), "Gentle Glycolic 20% + Cold Laser", "Approved", "Dr. Amara Okonjo", "Skin AI barrier stability: 91%."),
            DoctorCase("doc-2", "Senator Fatima Aliyu", 48, "Derma Aesthetics", 74, "Loss of dermal elasticity", listOf("No anticoagulants"), "Targeted RF Microneedling + Exosomes", "In Treatment", "Dr. Ngozi Eze", "Pre-procedure vitals optimal.")
        )

        _nurseProcedures.value = listOf(
            NurseProcedure("nr-1", "Dr. Amara Okonjo", "Suite A", "Derma Aesthetics", "Hydra-Glow Deep Infusion", listOf("Sanitize Handpiece", "Prepare 10ml HA Solution"), "Pressure 35 kPa", "Prep Ready", "Nurse Kemi Adeleke", "BP 118/76 · HR 68 bpm"),
            NurseProcedure("nr-2", "Senator Fatima Aliyu", "VIP Private Suite", "Derma Aesthetics", "RF Microneedling & Exosomes", listOf("Sterile Cartridge", "4% Lidocaine"), "Power Level 3", "In Procedure", "Nurse Cynthia Peters", "BP 124/82 · HR 72 bpm")
        )

        _staffShifts.value = listOf(
            StaffShift("s-1", "Dr. Ngozi Eze", "Lead Doctor", "branch-ph", "08:30 AM – 04:30 PM", "On Duty"),
            StaffShift("s-2", "Nurse Kemi Adeleke", "Aesthetic Nurse", "branch-ph", "08:00 AM – 04:00 PM", "On Duty")
        )

        _managerReminders.value = listOf(
            ManagerReminder("rem-1", "Inspect Clinical Autoclave & Sterilization Log", "Compliance", "High", false, "10:00 AM"),
            ManagerReminder("rem-2", "Sign Off Reception Float & Morning Balance", "Financial", "Medium", true, "08:30 AM")
        )

        _automationTasks.value = listOf(
            AutomationTask("tsk-1", "Reorder Niacinamide 10% (100 units)", "Stock dropped to 8 units.", "Port Harcourt", "Inventory", true, "approved", "Today 03:15 AM"),
            AutomationTask("tsk-2", "Reschedule 3 Facial Slots to Thursday", "Specialist on leave.", "Abuja", "Appointments", false, "pending", "Today 06:40 AM")
        )

        _subBrands.value = listOf(
            SubBrand("sb-1", "Skincare Kitchen", "Fresh artisanal serums", "$112.4K", "+18%", 46, true, listOf("Niacinamide 10%", "Hyaluronic B5")),
            SubBrand("sb-2", "Derma Aesthetics", "Clinical dermabrasion & peels", "$88.1K", "+12.5%", 36, false, listOf("Hydra-Glow", "Microneedling")),
            SubBrand("sb-3", "ESB Apothecary", "Medical prescription skincare", "$45.3K", "+6%", 18, true, listOf("Mineral SPF 50+", "Bio-Retinol"))
        )

        _customers.value = listOf(
            Customer("cust-1", "Dr. Amara Okonjo", "+234 802 334 1122", "amara.okonjo@gmail.com", "VIP Diamond", 4250.0, 18, "Combination / Sensitive", "Port Harcourt"),
            Customer("cust-2", "Senator Fatima Aliyu", "+234 809 111 8899", "f.aliyu@gov.ng", "VIP Diamond", 7890.0, 24, "Mature / Hydration Focus", "Abuja")
        )
    }

    fun selectBranch(branchId: String) {
        _selectedBranchId.value = branchId
    }

    fun addCrmPatient(
        name: String,
        phone: String,
        email: String,
        tier: String,
        skinType: String,
        primaryBranch: String,
        allergies: String,
        initialNote: String? = null
    ) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val notes = if (initialNote.isNullOrBlank()) emptyList() else listOf(
            CrmNote("n-${System.currentTimeMillis()}", "Front Desk", today, initialNote)
        )
        val newPatient = CrmPatient(
            id = "crm-${System.currentTimeMillis()}",
            name = name,
            phone = phone,
            email = email,
            tier = tier,
            lifetimeSpend = 0.0,
            visitsCount = 1,
            skinType = skinType,
            primaryBranch = primaryBranch,
            allergies = if (allergies.isBlank()) "None reported" else allergies,
            loyaltyPoints = 100,
            lastVisit = today,
            nextAppointment = null,
            tags = listOf(tier, primaryBranch),
            notes = notes,
            treatmentHistory = emptyList()
        )
        _crmPatients.value = listOf(newPatient) + _crmPatients.value
    }

    fun addCrmNote(patientId: String, author: String, text: String) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val newNote = CrmNote("n-${System.currentTimeMillis()}", author, today, text)
        _crmPatients.value = _crmPatients.value.map { p ->
            if (p.id == patientId) p.copy(notes = listOf(newNote) + p.notes) else p
        }
    }

    fun addLoyaltyPoints(patientId: String, pointsToAdd: Int) {
        _crmPatients.value = _crmPatients.value.map { p ->
            if (p.id == patientId) p.copy(loyaltyPoints = p.loyaltyPoints + pointsToAdd) else p
        }
    }

    fun addAppointment(
        patientName: String,
        patientPhone: String,
        patientEmail: String,
        branchId: String,
        service: String,
        scheduledAt: String,
        price: Double = 120.0,
        notes: String? = null
    ) {
        val newApt = Appointment(
            id = "apt-${System.currentTimeMillis()}",
            branchId = branchId,
            patientName = patientName,
            patientPhone = patientPhone,
            patientEmail = patientEmail,
            service = service,
            scheduledAt = scheduledAt,
            status = "scheduled",
            price = price,
            cost = price * 0.3,
            notes = notes
        )
        _appointments.value = listOf(newApt) + _appointments.value
    }

    fun updateAppointmentStatus(appointmentId: String, newStatus: String) {
        _appointments.value = _appointments.value.map {
            if (it.id == appointmentId) it.copy(status = newStatus) else it
        }
    }

    fun markFollowUpSent(followUpId: String) {
        _followUps.value = _followUps.value.map {
            if (it.id == followUpId) it.copy(status = "sent") else it
        }
    }

    fun restockItem(itemId: String, addedQty: Int) {
        _inventory.value = _inventory.value.map {
            if (it.id == itemId) it.copy(qty = it.qty + addedQty) else it
        }
    }

    fun adjustStock(itemId: String, delta: Int) {
        _inventory.value = _inventory.value.map {
            if (it.id == itemId) it.copy(qty = (it.qty + delta).coerceAtLeast(0)) else it
        }
    }

    fun approveTask(taskId: String) {
        _automationTasks.value = _automationTasks.value.map {
            if (it.id == taskId) it.copy(status = "approved") else it
        }
    }

    fun rejectTask(taskId: String) {
        _automationTasks.value = _automationTasks.value.map {
            if (it.id == taskId) it.copy(status = "rejected") else it
        }
    }

    fun updateSalesLeadStage(leadId: String, newStage: String) {
        _salesLeads.value = _salesLeads.value.map {
            if (it.id == leadId) it.copy(stage = newStage) else it
        }
    }

    fun updateDoctorCaseStatus(caseId: String, newStatus: String) {
        _doctorCases.value = _doctorCases.value.map {
            if (it.id == caseId) it.copy(status = newStatus) else it
        }
    }

    fun updateNurseProcedureStatus(procedureId: String, newStatus: String) {
        _nurseProcedures.value = _nurseProcedures.value.map {
            if (it.id == procedureId) it.copy(status = newStatus) else it
        }
    }

    fun toggleManagerReminder(reminderId: String) {
        _managerReminders.value = _managerReminders.value.map {
            if (it.id == reminderId) it.copy(isDone = !it.isDone) else it
        }
    }

    fun getCeoKpis(): CeoKpis {
        val branchProfits = listOf(
            BranchProfit("branch-ph", "Port Harcourt", "Port Harcourt", 48, 142600.0, 42800.0, 99800.0, 70, 152.0),
            BranchProfit("branch-abj", "Abuja", "Abuja", 36, 103200.0, 34500.0, 68700.0, 66, 184.0)
        )

        return CeoKpis(
            revenue30d = 245800.0,
            cost30d = 77300.0,
            profit30d = 168500.0,
            margin30d = 68,
            revenueGrowth = 12,
            appointmentsToday = 12,
            billableBookings30d = 84,
            csatPercent = 94,
            nps = 72,
            lowStockItems = 3,
            aiAutonomy = 82,
            pendingApprovals = _automationTasks.value.count { it.status == "pending" },
            branchProfit = branchProfits
        )
    }
}
