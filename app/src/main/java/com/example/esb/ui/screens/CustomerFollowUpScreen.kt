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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.data.model.FollowUp
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerFollowUpScreen(
    viewModel: EsbViewModel
) {
    val context = LocalContext.current
    val followUps by viewModel.filteredFollowUps.collectAsState()
    val currentDept by viewModel.departmentFilter.collectAsState()

    val departments = listOf("all", "Skincare Kitchen", "Derma Aesthetics", "ESB Apothecary", "Dental")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.MarkChatRead,
                        contentDescription = null,
                        tint = VioletLight,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Departmental Customer Follow-Ups",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Post-treatment protocols, routine check-ins, retention nudges & direct WhatsApp dispatch",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Department Selection Chips
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(departments) { dept ->
                    val isSelected = currentDept.equals(dept, ignoreCase = true)
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.setDepartmentFilter(dept) },
                        label = {
                            Text(
                                text = if (dept == "all") "All Departments" else dept,
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

        // Department Operational Protocol Guides Card
        item {
            val protocolSummary = when (currentDept) {
                "Skincare Kitchen" -> "Skincare Kitchen: Day 3 & Day 7 routine adherence check, custom serum absorption tweaks, and empty bottle replenishment prompts."
                "Derma Aesthetics" -> "Derma Aesthetics: Day 1 erythema/peel review, strict SPF 50 reminder, Day 14 follow-up consultation scheduling."
                "ESB Apothecary" -> "ESB Apothecary: Dermatological tolerance monitoring, bio-retinol titration guidance, refill authorization checks."
                "Dental" -> "Dental Studio: 24-hour laser sensitivity check, white-diet adherence tips, 6-month hygiene recall automation."
                else -> "Automated clinical and aesthetic follow-up protocols active across all 4 departments."
            }

            Surface(
                shape = RoundedCornerShape(14.dp),
                color = VioletAccent.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, VioletAccent.copy(alpha = 0.35f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = VioletLight,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = protocolSummary,
                        color = TextPrimary,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // Follow Up Cards List
        items(followUps) { item ->
            val isPending = item.status == "pending"

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("follow_up_dept_${item.id}"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (item.priority == "High" && isPending) GoldPrimary.copy(alpha = 0.5f) else NavyBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = item.patientName,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                if (item.priority == "High") {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = DangerRed.copy(alpha = 0.2f)
                                    ) {
                                        Text(
                                            text = "Priority",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = DangerRed,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = "${item.department} · Day ${item.daysPostTreatment} post-procedure",
                                fontSize = 11.sp,
                                color = GoldPrimary
                            )
                        }
                        StatusChip(status = item.status)
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Treatment: ${item.service}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Message box
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = NavySurfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = "Automated Protocol Script:",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = VioletLight
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = item.message,
                                fontSize = 12.sp,
                                color = TextPrimary,
                                lineHeight = 16.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Due: ${item.scheduledDate}",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Direct WhatsApp link button
                            Button(
                                onClick = {
                                    val cleanPhone = item.patientPhone.replace("[^0-9]".toRegex(), "")
                                    val uri = Uri.parse("https://wa.me/$cleanPhone?text=${Uri.encode(item.message)}")
                                    val intent = Intent(Intent.ACTION_VIEW, uri)
                                    try {
                                        context.startActivity(intent)
                                    } catch (_: Exception) {}
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(12.dp), tint = TextPrimary)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Send via WhatsApp", fontSize = 11.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                            }

                            if (isPending) {
                                OutlinedButton(
                                    onClick = { viewModel.markFollowUpSent(item.id) },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Text("Mark Sent", fontSize = 11.sp, color = GoldPrimary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
