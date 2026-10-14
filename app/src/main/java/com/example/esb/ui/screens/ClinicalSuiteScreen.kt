package com.example.esb.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@Composable
fun ClinicalSuiteScreen(
    viewModel: EsbViewModel
) {
    val doctorCases by viewModel.doctorCases.collectAsState()
    val nurseProcedures by viewModel.nurseProcedures.collectAsState()

    var activeTab by remember { mutableStateOf("doctor") } // "doctor" or "nurse"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Screen Header
        item {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.MedicalServices,
                        contentDescription = null,
                        tint = VioletLight,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Clinical & Aesthetic Suite",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Medical diagnostics, procedure prep, dosage guidance & clinical sign-offs",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Doctor / Nurse Tab Switcher
        item {
            TabRow(
                selectedTabIndex = if (activeTab == "doctor") 0 else 1,
                containerColor = NavySurface,
                contentColor = GoldPrimary,
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .testTag("clinical_tab_row")
            ) {
                Tab(
                    selected = activeTab == "doctor",
                    onClick = { activeTab = "doctor" },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Doctor Dashboard", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                )
                Tab(
                    selected = activeTab == "nurse",
                    onClick = { activeTab = "nurse" },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Healing, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Nurse Dashboard", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                )
            }
        }

        if (activeTab == "doctor") {
            // DOCTOR DASHBOARD VIEW
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Clinical Diagnostic Cases (${doctorCases.size})",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Skin AI Integrated",
                        fontSize = 12.sp,
                        color = VioletLight
                    )
                }
            }

            items(doctorCases) { c ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("doctor_case_${c.id}"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NavyCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = c.patientName,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Age: ${c.age} · ${c.department}",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }

                            // Skin AI Score Badge
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (c.skinAiScore >= 75) SuccessGreen.copy(alpha = 0.2f) else WarningOrange.copy(alpha = 0.2f)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(12.dp), tint = GoldPrimary)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Skin AI: ${c.skinAiScore}/100",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPrimary
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Diagnosis: ${c.primaryDiagnosis}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = GoldText
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        // Contraindications tags
                        if (c.contraindications.isNotEmpty()) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Warning, contentDescription = null, tint = DangerRed, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Contraindications: ${c.contraindications.joinToString("; ")}",
                                    fontSize = 11.sp,
                                    color = DangerRed
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                        }

                        // Prescribed Protocol
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = NavySurfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Approved Clinical Protocol:",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = VioletLight
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text = c.treatmentProtocol, fontSize = 12.sp, color = TextPrimary)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(text = "Clinical note: ${c.clinicalNotes}", fontSize = 11.sp, color = TextSecondary)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            StatusChip(status = c.status)

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                if (c.status != "Approved" && c.status != "Completed") {
                                    Button(
                                        onClick = { viewModel.updateDoctorCaseStatus(c.id, "Approved") },
                                        shape = RoundedCornerShape(8.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                        modifier = Modifier.height(28.dp)
                                    ) {
                                        Text("Approve Protocol", fontSize = 11.sp, color = NavyBackground, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (c.status != "Completed") {
                                    OutlinedButton(
                                        onClick = { viewModel.updateDoctorCaseStatus(c.id, "Completed") },
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                        modifier = Modifier.height(28.dp)
                                    ) {
                                        Text("Sign & Complete", fontSize = 11.sp, color = SuccessGreen)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // NURSE DASHBOARD VIEW
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Nurse Procedure Queue & Prep",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Active Clinical Rooms",
                        fontSize = 12.sp,
                        color = GoldPrimary
                    )
                }
            }

            items(nurseProcedures) { p ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("nurse_procedure_${p.id}"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = NavyCard),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = p.patientName,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${p.room} · Nurse: ${p.assignedNurse}",
                                    fontSize = 12.sp,
                                    color = GoldPrimary
                                )
                            }
                            StatusChip(status = p.status)
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Procedure: ${p.procedureName}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Vitals: ${p.vitals}",
                            fontSize = 11.sp,
                            color = SuccessGreen
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Prep checklist
                        Text(
                            text = "Procedure Prep Checklist:",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = VioletLight
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        p.prepChecklist.forEach { itemText ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(vertical = 2.dp)
                            ) {
                                Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = itemText, fontSize = 12.sp, color = TextPrimary)
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Dosage specs
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = NavySurfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Speed, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(text = "Specs: ${p.dosageSpecs}", fontSize = 11.sp, color = TextPrimary)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (p.status != "In Procedure" && p.status != "Aftercare Delivered") {
                                OutlinedButton(
                                    onClick = { viewModel.updateNurseProcedureStatus(p.id, "Prep Ready") },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Prep Ready", fontSize = 11.sp, color = GoldPrimary)
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Button(
                                    onClick = { viewModel.updateNurseProcedureStatus(p.id, "In Procedure") },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = VioletAccent),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Begin Treatment", fontSize = 11.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                                }
                            } else if (p.status == "In Procedure") {
                                Button(
                                    onClick = { viewModel.updateNurseProcedureStatus(p.id, "Aftercare Delivered") },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Deliver Aftercare & Complete", fontSize = 11.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
