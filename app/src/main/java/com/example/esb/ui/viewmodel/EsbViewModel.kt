package com.example.esb.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.esb.data.model.*
import com.example.esb.data.repository.EsbRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val sender: String,
    val text: String,
    val timestamp: String
)

class EsbViewModel(
    private val repository: EsbRepository = EsbRepository()
) : ViewModel() {

    val branches = repository.branches
    val selectedBranchId = repository.selectedBranchId

    // Search and filters
    private val _appointmentSearchQuery = MutableStateFlow("")
    val appointmentSearchQuery = _appointmentSearchQuery.asStateFlow()

    private val _appointmentStatusFilter = MutableStateFlow("all")
    val appointmentStatusFilter = _appointmentStatusFilter.asStateFlow()

    private val _inventoryCategoryFilter = MutableStateFlow("all")
    val inventoryCategoryFilter = _inventoryCategoryFilter.asStateFlow()

    private val _inventoryOnlyLowStock = MutableStateFlow(false)
    val inventoryOnlyLowStock = _inventoryOnlyLowStock.asStateFlow()

    // Department Filter for Follow-ups & Sales
    private val _departmentFilter = MutableStateFlow("all")
    val departmentFilter = _departmentFilter.asStateFlow()

    // CRM Search & Tier Filters
    private val _crmSearchQuery = MutableStateFlow("")
    val crmSearchQuery = _crmSearchQuery.asStateFlow()

    private val _crmTierFilter = MutableStateFlow("all")
    val crmTierFilter = _crmTierFilter.asStateFlow()

    // Filtered Appointments
    val filteredAppointments: StateFlow<List<Appointment>> = combine(
        repository.appointments,
        selectedBranchId,
        _appointmentSearchQuery,
        _appointmentStatusFilter
    ) { all, branchId, query, status ->
        all.filter { apt ->
            val matchesBranch = apt.branchId == branchId
            val matchesStatus = if (status == "all") true else apt.status.equals(status, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    apt.patientName.contains(query, ignoreCase = true) ||
                    apt.service.contains(query, ignoreCase = true) ||
                    apt.patientPhone.contains(query, ignoreCase = true)
            matchesBranch && matchesStatus && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    // Filtered Inventory
    val filteredInventory: StateFlow<List<InventoryItem>> = combine(
        repository.inventory,
        selectedBranchId,
        _inventoryCategoryFilter,
        _inventoryOnlyLowStock
    ) { all, branchId, category, onlyLow ->
        all.filter { item ->
            val matchesBranch = item.branchId == branchId
            val matchesCategory = if (category == "all") true else item.category.equals(category, ignoreCase = true)
            val matchesLow = if (onlyLow) item.qty <= item.lowStockThreshold else true
            matchesBranch && matchesCategory && matchesLow
        }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    // Filtered Follow-ups by Department
    val filteredFollowUps: StateFlow<List<FollowUp>> = combine(
        repository.followUps,
        _departmentFilter
    ) { all, dept ->
        if (dept == "all") all else all.filter { it.department.equals(dept, ignoreCase = true) }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    // CRM 360 Filtered Patients
    val filteredCrmPatients: StateFlow<List<CrmPatient>> = combine(
        repository.crmPatients,
        _crmSearchQuery,
        _crmTierFilter
    ) { patients, query, tier ->
        patients.filter { p ->
            val matchesTier = if (tier == "all") true else p.tier.equals(tier, ignoreCase = true)
            val matchesQuery = query.isBlank() ||
                    p.name.contains(query, ignoreCase = true) ||
                    p.phone.contains(query, ignoreCase = true) ||
                    p.skinType.contains(query, ignoreCase = true) ||
                    p.tags.any { it.contains(query, ignoreCase = true) }
            matchesTier && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val followUps = repository.followUps
    val automationTasks = repository.automationTasks
    val subBrands = repository.subBrands
    val customers = repository.customers
    val crmPatients = repository.crmPatients

    // Sales Department Data
    val salesMetrics = repository.salesMetrics
    val salesLeads = repository.salesLeads

    // Doctor & Nurse Dashboards Data
    val doctorCases = repository.doctorCases
    val nurseProcedures = repository.nurseProcedures

    // Manager Dashboard Data
    val staffShifts = repository.staffShifts
    val managerReminders = repository.managerReminders

    // AI CEO Chat conversation
    private val _chatMessages = MutableStateFlow(
        listOf(
            ChatMessage(
                id = "m-1",
                sender = "ceo_ai",
                text = "Welcome to ESB Orchestrator. Overnight I executed 9 automated stock and shift routines. 2 approvals are waiting for your signature.",
                timestamp = "08:00 AM"
            )
        )
    )
    val chatMessages = _chatMessages.asStateFlow()

    fun switchBranch(branchId: String) {
        repository.selectBranch(branchId)
    }

    fun setAppointmentSearch(query: String) {
        _appointmentSearchQuery.value = query
    }

    fun setAppointmentStatusFilter(status: String) {
        _appointmentStatusFilter.value = status
    }

    fun setDepartmentFilter(dept: String) {
        _departmentFilter.value = dept
    }

    fun setCrmSearch(query: String) {
        _crmSearchQuery.value = query
    }

    fun setCrmTierFilter(tier: String) {
        _crmTierFilter.value = tier
    }

    fun setInventoryCategory(category: String) {
        _inventoryCategoryFilter.value = category
    }

    fun toggleInventoryLowStock(showOnlyLow: Boolean) {
        _inventoryOnlyLowStock.value = showOnlyLow
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
        repository.addCrmPatient(name, phone, email, tier, skinType, primaryBranch, allergies, initialNote)
    }

    fun addCrmNote(patientId: String, author: String, noteText: String) {
        repository.addCrmNote(patientId, author, noteText)
    }

    fun addLoyaltyPoints(patientId: String, points: Int) {
        repository.addLoyaltyPoints(patientId, points)
    }

    fun createAppointment(
        patientName: String,
        patientPhone: String,
        patientEmail: String,
        service: String,
        scheduledAt: String,
        price: Double = 120.0,
        notes: String? = null
    ) {
        repository.addAppointment(
            patientName = patientName,
            patientPhone = patientPhone,
            patientEmail = patientEmail,
            branchId = selectedBranchId.value,
            service = service,
            scheduledAt = scheduledAt,
            price = price,
            notes = notes
        )
    }

    fun updateAppointmentStatus(appointmentId: String, newStatus: String) {
        repository.updateAppointmentStatus(appointmentId, newStatus)
    }

    fun markFollowUpSent(followUpId: String) {
        repository.markFollowUpSent(followUpId)
    }

    fun restockItem(itemId: String, quantity: Int) {
        repository.restockItem(itemId, quantity)
    }

    fun adjustStock(itemId: String, delta: Int) {
        repository.adjustStock(itemId, delta)
    }

    fun approveTask(taskId: String) {
        repository.approveTask(taskId)
    }

    fun rejectTask(taskId: String) {
        repository.rejectTask(taskId)
    }

    fun updateSalesLeadStage(leadId: String, newStage: String) {
        repository.updateSalesLeadStage(leadId, newStage)
    }

    fun updateDoctorCaseStatus(caseId: String, newStatus: String) {
        repository.updateDoctorCaseStatus(caseId, newStatus)
    }

    fun updateNurseProcedureStatus(procedureId: String, newStatus: String) {
        repository.updateNurseProcedureStatus(procedureId, newStatus)
    }

    fun toggleManagerReminder(reminderId: String) {
        repository.toggleManagerReminder(reminderId)
    }

    fun getCeoKpis(): CeoKpis = repository.getCeoKpis()

    fun sendCeoAiPrompt(prompt: String) {
        if (prompt.isBlank()) return
        val userMsg = ChatMessage(
            id = "m-${System.currentTimeMillis()}",
            sender = "user",
            text = prompt,
            timestamp = "Just now"
        )
        _chatMessages.value = _chatMessages.value + userMsg

        val reply = when {
            prompt.contains("restock", ignoreCase = true) || prompt.contains("inventory", ignoreCase = true) ->
                "Analyzing Port Harcourt inventory: Niacinamide 10% is at 8 units. Automated purchase order #PO-4091 has been drafted for 100 units from Skincare Kitchen central lab."
            prompt.contains("staff", ignoreCase = true) || prompt.contains("shift", ignoreCase = true) ->
                "Staffing analysis: Wednesday PM at Abuja Derma Aesthetics has high demand for Collagen Renewal. Recommend reallocating 2 senior estheticians."
            prompt.contains("revenue", ignoreCase = true) || prompt.contains("growth", ignoreCase = true) ->
                "30-day aggregate revenue stands at $245,800 (+12% vs prior month). Port Harcourt delivered 58% of volume; Abuja avg ticket is $184."
            prompt.contains("crm", ignoreCase = true) || prompt.contains("patient", ignoreCase = true) || prompt.contains("vip", ignoreCase = true) ->
                "CRM intelligence: 2 VIP Diamond patients scheduled today. Dr. Amara ($4.2K LTV) in Suite A; Senator Fatima ($7.8K LTV) in VIP Suite."
            else ->
                "Analyzing '$prompt' across ESB Brand data models... Strategy recommendation: Continue scaling bespoke Serum Bar slots while automating 48-hr patient follow-ups."
        }

        viewModelScope.launch {
            val aiMsg = ChatMessage(
                id = "m-${System.currentTimeMillis() + 1}",
                sender = "ceo_ai",
                text = reply,
                timestamp = "Just now"
            )
            _chatMessages.value = _chatMessages.value + aiMsg
        }
    }
}
