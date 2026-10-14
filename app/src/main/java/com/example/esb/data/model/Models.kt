package com.example.esb.data.model

data class Branch(
    val id: String,
    val name: String,
    val city: String,
    val phone: String,
    val address: String,
    val whatsapp: String
)

data class Appointment(
    val id: String,
    val branchId: String,
    val patientName: String,
    val patientPhone: String,
    val patientEmail: String,
    val service: String,
    val department: String = "Derma Aesthetics",
    val scheduledAt: String,
    val durationMinutes: Int = 45,
    val status: String,
    val price: Double = 120.0,
    val cost: Double = 35.0,
    val doctorOrNurse: String = "Dr. Amara Okonjo",
    val room: String = "Room 1",
    val notes: String? = null
)

data class FollowUp(
    val id: String,
    val appointmentId: String,
    val patientName: String,
    val patientPhone: String,
    val department: String,
    val service: String,
    val message: String,
    val status: String,
    val scheduledDate: String,
    val daysPostTreatment: Int = 1,
    val priority: String = "Normal"
)

data class InventoryItem(
    val id: String,
    val branchId: String,
    val name: String,
    val sku: String,
    val brand: String,
    val category: String,
    val qty: Int,
    val lowStockThreshold: Int = 15,
    val unitPrice: Double = 45.0
)

data class AutomationTask(
    val id: String,
    val title: String,
    val description: String,
    val branchName: String,
    val category: String,
    val isAuto: Boolean,
    val status: String,
    val timestamp: String
)

data class BranchProfit(
    val branchId: String,
    val name: String,
    val city: String,
    val bookings: Int,
    val revenue: Double,
    val cost: Double,
    val profit: Double,
    val margin: Int,
    val avgTicket: Double
)

data class CeoKpis(
    val revenue30d: Double,
    val cost30d: Double,
    val profit30d: Double,
    val margin30d: Int,
    val revenueGrowth: Int,
    val appointmentsToday: Int,
    val billableBookings30d: Int,
    val csatPercent: Int,
    val nps: Int,
    val lowStockItems: Int,
    val aiAutonomy: Int,
    val pendingApprovals: Int,
    val branchProfit: List<BranchProfit>
)

data class SubBrand(
    val id: String,
    val name: String,
    val tagline: String,
    val monthlyRevenue: String,
    val growthPercent: String,
    val sharePercent: Int,
    val isGold: Boolean,
    val topOfferings: List<String>
)

data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val tier: String,
    val totalSpend: Double,
    val visitsCount: Int,
    val skinType: String,
    val primaryBranch: String
)

// --- Specialized CRM Models ---

data class CrmNote(
    val id: String,
    val author: String,
    val date: String,
    val content: String
)

data class CrmTreatmentRecord(
    val id: String,
    val date: String,
    val service: String,
    val provider: String,
    val cost: Double
)

data class CrmPatient(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val tier: String, // "VIP Diamond", "Gold Elite", "Member"
    val lifetimeSpend: Double,
    val visitsCount: Int,
    val skinType: String,
    val primaryBranch: String,
    val allergies: String,
    val loyaltyPoints: Int,
    val lastVisit: String,
    val nextAppointment: String?,
    val tags: List<String>,
    val notes: List<CrmNote>,
    val treatmentHistory: List<CrmTreatmentRecord>
)

data class SalesDepartmentMetric(
    val department: String,
    val targetRevenue: Double,
    val actualRevenue: Double,
    val pipelineDealsCount: Int,
    val closedDealsCount: Int,
    val conversionRate: Int,
    val avgOrderValue: Double,
    val topReps: List<String>,
    val highlights: String
)

data class SalesLead(
    val id: String,
    val customerName: String,
    val phone: String,
    val department: String,
    val stage: String,
    val dealValue: Double,
    val repName: String,
    val notes: String
)

data class DoctorCase(
    val id: String,
    val patientName: String,
    val age: Int,
    val department: String,
    val skinAiScore: Int,
    val primaryDiagnosis: String,
    val contraindications: List<String>,
    val treatmentProtocol: String,
    val status: String,
    val assignedDoctor: String,
    val clinicalNotes: String
)

data class NurseProcedure(
    val id: String,
    val patientName: String,
    val room: String,
    val department: String,
    val procedureName: String,
    val prepChecklist: List<String>,
    val dosageSpecs: String,
    val status: String,
    val assignedNurse: String,
    val vitals: String
)

data class StaffShift(
    val id: String,
    val name: String,
    val role: String,
    val branchId: String,
    val timeSlot: String,
    val status: String
)

data class ManagerReminder(
    val id: String,
    val title: String,
    val category: String,
    val priority: String,
    val isDone: Boolean,
    val dueTime: String
)
