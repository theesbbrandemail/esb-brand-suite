package com.example.esb.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.data.model.CrmPatient
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrmScreen(
    viewModel: EsbViewModel
) {
    val context = LocalContext.current
    val patients by viewModel.filteredCrmPatients.collectAsState()
    val searchQuery by viewModel.crmSearchQuery.collectAsState()
    val currentTierFilter by viewModel.crmTierFilter.collectAsState()

    var showAddPatientDialog by remember { mutableStateOf(false) }
    var selectedPatientForNote by remember { mutableStateOf<CrmPatient?>(null) }
    var selectedPatientForHistory by remember { mutableStateOf<CrmPatient?>(null) }
    var selectedPatientForWhatsApp by remember { mutableStateOf<CrmPatient?>(null) }

    val tiers = listOf("all", "VIP Diamond", "Gold Elite", "Member")

    Scaffold(
        containerColor = NavyBackground,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddPatientDialog = true },
                containerColor = GoldPrimary,
                contentColor = NavyBackground,
                shape = CircleShape,
                modifier = Modifier.testTag("add_patient_crm_fab")
            ) {
                Icon(imageVector = Icons.Default.PersonAdd, contentDescription = "Add New Patient")
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Screen Header
            item {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Badge,
                            contentDescription = null,
                            tint = GoldPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Client & Patient 360 CRM",
                            color = TextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "VIP relationship management, clinical profiles, loyalty points & 1-touch WhatsApp outreach",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                }
            }

            // Quick Stats Banner
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NavyCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, GoldPrimary.copy(alpha = 0.35f)),
                    modifier = Modifier.fillMaxWidth().testTag("crm_metrics_card")
                ) {
                    Row(
                        modifier = Modifier
                            .padding(16.dp)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Total Clients", fontSize = 10.sp, color = TextSecondary)
                            Text("${patients.size}", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Active in CRM", fontSize = 10.sp, color = SuccessGreen)
                        }
                        Column {
                            Text("VIP Diamonds", fontSize = 10.sp, color = TextSecondary)
                            Text("${patients.count { it.tier == "VIP Diamond" }}", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = GoldText)
                            Text("High-Touch Care", fontSize = 10.sp, color = GoldPrimary)
                        }
                        Column {
                            Text("Avg Client LTV", fontSize = 10.sp, color = TextSecondary)
                            val avgLtv = if (patients.isNotEmpty()) patients.map { it.lifetimeSpend }.average() else 0.0
                            Text("$${String.format("%,.0f", avgLtv)}", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("Lifetime Value", fontSize = 10.sp, color = VioletLight)
                        }
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.setCrmSearch(it) },
                    placeholder = { Text("Search by name, phone, skin type, or tag...", color = TextSecondary, fontSize = 13.sp) },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = TextSecondary)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.setCrmSearch("") }) {
                                Icon(imageVector = Icons.Default.Clear, contentDescription = "Clear", tint = TextSecondary)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("crm_search_input"),
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = NavyCard,
                        unfocusedContainerColor = NavyCard,
                        focusedBorderColor = GoldPrimary,
                        unfocusedBorderColor = NavyBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    singleLine = true
                )
            }

            // VIP Tier Filter Chips
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(tiers) { tier ->
                        val isSelected = currentTierFilter.equals(tier, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.setCrmTierFilter(tier) },
                            label = {
                                Text(
                                    text = if (tier == "all") "All Tiers" else tier,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = GoldPrimary,
                                selectedLabelColor = NavyBackground,
                                containerColor = NavySurface,
                                labelColor = TextSecondary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = if (isSelected) GoldPrimary else NavyBorder
                            )
                        )
                    }
                }
            }

            // Client Cards List
            items(patients) { p ->
                val isDiamond = p.tier == "VIP Diamond"

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("crm_patient_card_${p.id}"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NavyCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isDiamond) GoldPrimary.copy(alpha = 0.5f) else NavyBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Card Header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(CircleShape)
                                        .background(if (isDiamond) GoldPrimary.copy(alpha = 0.2f) else NavySurfaceVariant),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = p.name.split(" ").mapNotNull { it.firstOrNull()?.toString() }.take(2).joinToString(""),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = if (isDiamond) GoldText else TextPrimary
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = p.name,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "${p.phone} · ${p.primaryBranch}",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                            StatusChip(status = if (isDiamond) "gold" else "confirmed")
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Skin Profile & Allergies Info
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = NavySurfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(imageVector = Icons.Default.Face, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Skin Profile: ${p.skinType}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                }
                                if (p.allergies != "None" && p.allergies != "None reported") {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = DangerRed, modifier = Modifier.size(12.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Allergies: ${p.allergies}",
                                            fontSize = 11.sp,
                                            color = DangerRed
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Financial & Loyalty Metrics
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Lifetime Spend", fontSize = 10.sp, color = TextSecondary)
                                Text("$${String.format("%,.0f", p.lifetimeSpend)}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldText)
                            }
                            Column {
                                Text("Total Visits", fontSize = 10.sp, color = TextSecondary)
                                Text("${p.visitsCount}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            }
                            Column {
                                Text("Loyalty Points", fontSize = 10.sp, color = TextSecondary)
                                Text("${p.loyaltyPoints} pts", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = VioletLight)
                            }
                            Column {
                                Text("Last Visit", fontSize = 10.sp, color = TextSecondary)
                                Text(p.lastVisit, fontSize = 12.sp, color = TextSecondary)
                            }
                        }

                        // Tags List
                        if (p.tags.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(10.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                items(p.tags) { tag ->
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = NavySurfaceVariant
                                    ) {
                                        Text(
                                            text = "#$tag",
                                            fontSize = 10.sp,
                                            color = TextSecondary,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = NavyBorder.copy(alpha = 0.4f))
                        Spacer(modifier = Modifier.height(10.dp))

                        // Quick Actions Toolbar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                // Direct Call
                                IconButton(
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${p.phone.replace("[^0-9+]".toRegex(), "")}"))
                                        try { context.startActivity(intent) } catch (_: Exception) {}
                                    },
                                    modifier = Modifier.size(32.dp).background(NavySurfaceVariant, CircleShape)
                                ) {
                                    Icon(imageVector = Icons.Default.Phone, contentDescription = "Call", tint = GoldPrimary, modifier = Modifier.size(16.dp))
                                }

                                // Quick WhatsApp
                                IconButton(
                                    onClick = { selectedPatientForWhatsApp = p },
                                    modifier = Modifier.size(32.dp).background(SuccessGreen.copy(alpha = 0.2f), CircleShape)
                                ) {
                                    Icon(imageVector = Icons.Default.Chat, contentDescription = "WhatsApp Outreach", tint = SuccessGreen, modifier = Modifier.size(16.dp))
                                }

                                // Add Note
                                IconButton(
                                    onClick = { selectedPatientForNote = p },
                                    modifier = Modifier.size(32.dp).background(VioletAccent.copy(alpha = 0.2f), CircleShape)
                                ) {
                                    Icon(imageVector = Icons.Default.NoteAdd, contentDescription = "Add Clinical Note", tint = VioletLight, modifier = Modifier.size(16.dp))
                                }
                            }

                            // View Full History & Notes
                            OutlinedButton(
                                onClick = { selectedPatientForHistory = p },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("Timeline (${p.notes.size + p.treatmentHistory.size})", fontSize = 11.sp, color = GoldPrimary)
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal 1: Add New Patient Wizard
    if (showAddPatientDialog) {
        var name by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("") }
        var email by remember { mutableStateOf("") }
        var tier by remember { mutableStateOf("Member") }
        var skinType by remember { mutableStateOf("Combination / Sensitive") }
        var branch by remember { mutableStateOf("Port Harcourt") }
        var allergies by remember { mutableStateOf("None reported") }
        var initialNote by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddPatientDialog = false },
            containerColor = NavySurfaceVariant,
            title = {
                Text("New Patient Intake Form", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth().testTag("new_patient_name"),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        modifier = Modifier.fillMaxWidth().testTag("new_patient_phone"),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email (Optional)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = skinType,
                        onValueChange = { skinType = it },
                        label = { Text("Skin Profile / Concerns") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = allergies,
                        onValueChange = { allergies = it },
                        label = { Text("Allergies / Contraindications") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = initialNote,
                        onValueChange = { initialNote = it },
                        label = { Text("Initial Consultation Notes") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank() && phone.isNotBlank()) {
                            viewModel.addCrmPatient(
                                name = name,
                                phone = phone,
                                email = email,
                                tier = tier,
                                skinType = skinType,
                                primaryBranch = branch,
                                allergies = allergies,
                                initialNote = initialNote.ifBlank { null }
                            )
                            showAddPatientDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
                    modifier = Modifier.testTag("submit_new_patient")
                ) {
                    Text("Save to CRM", color = NavyBackground, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddPatientDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }

    // Modal 2: Add Clinical Note to Patient
    selectedPatientForNote?.let { targetPatient ->
        var noteText by remember { mutableStateOf("") }
        var staffAuthor by remember { mutableStateOf("Front Desk Concierge") }

        AlertDialog(
            onDismissRequest = { selectedPatientForNote = null },
            containerColor = NavySurfaceVariant,
            title = {
                Text("Log Observation for ${targetPatient.name}", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = staffAuthor,
                        onValueChange = { staffAuthor = it },
                        label = { Text("Staff Member / Specialist") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = noteText,
                        onValueChange = { noteText = it },
                        label = { Text("Clinical Note / Treatment Feedback") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (noteText.isNotBlank()) {
                            viewModel.addCrmNote(targetPatient.id, staffAuthor, noteText)
                            selectedPatientForNote = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
                ) {
                    Text("Save Note", color = NavyBackground, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedPatientForNote = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }

    // Modal 3: One-Click WhatsApp Template Selector
    selectedPatientForWhatsApp?.let { targetPatient ->
        val templates = listOf(
            "Appointment Reminder" to "Hello ${targetPatient.name}, this is ESB Brand Concierge confirming your upcoming consultation at ${targetPatient.primaryBranch}. Looking forward to hosting you!",
            "Post-Care Check" to "Hi ${targetPatient.name}, checking in post-treatment! How is your skin feeling today? Please remember to reapply your ESB Mineral SPF 50+.",
            "VIP Diamond Reward" to "Dear ${targetPatient.name}, as our cherished VIP Diamond guest, you have ${targetPatient.loyaltyPoints} points available. Enjoy a complimentary Serum Bar custom blend on your next visit!",
            "Skincare Routine Check" to "Hello ${targetPatient.name}, how is your customized home regimen performing? Let us know if you need any hydration or active tweaks!"
        )

        AlertDialog(
            onDismissRequest = { selectedPatientForWhatsApp = null },
            containerColor = NavySurfaceVariant,
            title = {
                Text("WhatsApp Outreach: ${targetPatient.name}", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Select a personalized script to send immediately:", fontSize = 12.sp, color = TextSecondary)
                    templates.forEach { (title, script) ->
                        Surface(
                            onClick = {
                                val cleanPhone = targetPatient.phone.replace("[^0-9]".toRegex(), "")
                                val uri = Uri.parse("https://wa.me/$cleanPhone?text=${Uri.encode(script)}")
                                try { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) {}
                                selectedPatientForWhatsApp = null
                            },
                            shape = RoundedCornerShape(10.dp),
                            color = NavyCard,
                            border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldPrimary)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text = script, fontSize = 11.sp, color = TextPrimary, lineHeight = 15.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { selectedPatientForWhatsApp = null }) {
                    Text("Close", color = TextSecondary)
                }
            }
        )
    }

    // Modal 4: Patient Timeline & History Log
    selectedPatientForHistory?.let { targetPatient ->
        AlertDialog(
            onDismissRequest = { selectedPatientForHistory = null },
            containerColor = NavySurfaceVariant,
            title = {
                Text("${targetPatient.name} — Profile Timeline", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Treatment & Purchase History (${targetPatient.treatmentHistory.size}):", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldPrimary)
                    if (targetPatient.treatmentHistory.isEmpty()) {
                        Text("No treatments recorded yet.", fontSize = 11.sp, color = TextSecondary)
                    } else {
                        targetPatient.treatmentHistory.forEach { tr ->
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = NavyCard,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(text = tr.service, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                                        Text(text = "${tr.date} · ${tr.provider}", fontSize = 10.sp, color = TextSecondary)
                                    }
                                    Text(text = "$${tr.cost.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = GoldText)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Clinical Notes (${targetPatient.notes.size}):", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = VioletLight)
                    if (targetPatient.notes.isEmpty()) {
                        Text("No clinical notes logged yet.", fontSize = 11.sp, color = TextSecondary)
                    } else {
                        targetPatient.notes.forEach { n ->
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = NavyCard,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text(text = "${n.author} (${n.date})", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = GoldPrimary)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(text = n.content, fontSize = 11.sp, color = TextPrimary)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.addLoyaltyPoints(targetPatient.id, 100)
                        selectedPatientForHistory = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
                ) {
                    Text("+100 Loyalty Pts", color = NavyBackground, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedPatientForHistory = null }) {
                    Text("Close", color = TextSecondary)
                }
            }
        )
    }
}
