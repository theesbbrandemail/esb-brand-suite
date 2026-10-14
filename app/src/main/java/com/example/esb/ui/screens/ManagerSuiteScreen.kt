package com.example.esb.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.data.model.InventoryItem
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@Composable
fun ManagerSuiteScreen(
    viewModel: EsbViewModel,
    onNavigate: (String) -> Unit
) {
    val branches = viewModel.branches
    val selectedBranchId by viewModel.selectedBranchId.collectAsState()
    val staffShifts by viewModel.staffShifts.collectAsState()
    val reminders by viewModel.managerReminders.collectAsState()
    val inventory by viewModel.filteredInventory.collectAsState()
    val kpis = viewModel.getCeoKpis()

    val currentBranch = branches.find { it.id == selectedBranchId } ?: branches.first()

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
                        imageVector = Icons.Default.SupervisorAccount,
                        contentDescription = null,
                        tint = GoldPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Branch Manager Suite",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Live branch oversight: staff shifts, room occupancy, compliance checklist & instant stock adjustment",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Live Operations Snapshot Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, GoldPrimary.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth().testTag("manager_snapshot_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "CURRENT BRANCH",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldPrimary,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "${currentBranch.name} (${currentBranch.city})",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = SuccessGreen.copy(alpha = 0.2f)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(SuccessGreen)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Shift Active", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Today's Appointments", fontSize = 10.sp, color = TextSecondary)
                            Text("${kpis.appointmentsToday} Booked", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        }
                        Column {
                            Text("Room Occupancy", fontSize = 10.sp, color = TextSecondary)
                            Text("88% Optimal", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = GoldText)
                        }
                        Column {
                            Text("Low Stock SKUs", fontSize = 10.sp, color = TextSecondary)
                            Text("${kpis.lowStockItems} Alert", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = WarningOrange)
                        }
                    }
                }
            }
        }

        // Daily Manager Operations & Compliance Checklist
        item {
            val pendingCount = reminders.count { !it.isDone }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Daily Operations Checklist",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "$pendingCount Tasks Pending",
                    fontSize = 12.sp,
                    color = GoldPrimary
                )
            }
        }

        items(reminders) { rem ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { viewModel.toggleManagerReminder(rem.id) }
                    .testTag("manager_reminder_${rem.id}"),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = if (rem.isDone) NavySurfaceVariant.copy(alpha = 0.6f) else NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = rem.isDone,
                        onCheckedChange = { viewModel.toggleManagerReminder(rem.id) },
                        colors = CheckboxDefaults.colors(
                            checkedColor = GoldPrimary,
                            checkmarkColor = NavyBackground,
                            uncheckedColor = TextSecondary
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = rem.title,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (rem.isDone) TextSecondary else TextPrimary
                        )
                        Text(
                            text = "${rem.category} · Due: ${rem.dueTime}",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                    StatusChip(status = if (rem.isDone) "completed" else rem.priority)
                }
            }
        }

        // Staff Shifts & Attendance Roster
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Staff Shift Roster",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "All Station Roster",
                    fontSize = 12.sp,
                    color = VioletLight
                )
            }
        }

        items(staffShifts) { staff ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(NavySurfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = staff.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text(text = "${staff.role} · ${staff.timeSlot}", fontSize = 11.sp, color = TextSecondary)
                    }
                    StatusChip(status = staff.status)
                }
            }
        }

        // Fast Floor Inventory Adjustment Tool
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Floor Stock Quick-Adjustment",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                TextButton(onClick = { onNavigate("inventory") }) {
                    Text("Full Inventory →", fontSize = 12.sp, color = GoldPrimary)
                }
            }
        }

        items(inventory.take(4)) { item ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = item.name, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Text(text = "SKU: ${item.sku} · Min: ${item.lowStockThreshold}", fontSize = 11.sp, color = TextSecondary)
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { viewModel.adjustStock(item.id, -1) },
                            modifier = Modifier
                                .size(28.dp)
                                .background(NavySurfaceVariant, CircleShape)
                        ) {
                            Icon(imageVector = Icons.Default.Remove, contentDescription = "Decrease", tint = TextPrimary, modifier = Modifier.size(14.dp))
                        }
                        Text(
                            text = "${item.qty}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (item.qty <= item.lowStockThreshold) DangerRed else TextPrimary,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(
                            onClick = { viewModel.adjustStock(item.id, +1) },
                            modifier = Modifier
                                .size(28.dp)
                                .background(GoldPrimary, CircleShape)
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = "Increase", tint = NavyBackground, modifier = Modifier.size(14.dp))
                        }
                    }
                }
            }
        }
    }
}
