package com.example.esb.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.example.esb.data.model.SalesDepartmentMetric
import com.example.esb.data.model.SalesLead
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalesDashboardScreen(
    viewModel: EsbViewModel
) {
    val salesMetrics by viewModel.salesMetrics.collectAsState()
    val salesLeads by viewModel.salesLeads.collectAsState()
    var selectedDept by remember { mutableStateOf("all") }

    val departments = listOf("all", "Skincare Kitchen", "Derma Aesthetics", "ESB Apothecary", "Dental Studio")

    val filteredLeads = remember(salesLeads, selectedDept) {
        if (selectedDept == "all") salesLeads else salesLeads.filter { it.department.equals(selectedDept, ignoreCase = true) }
    }

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
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = GoldPrimary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Sales Team Dashboard",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Departmental revenue targets, deal pipelines, conversion rates & top performers",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Aggregate Sales Summary Banner
        item {
            val totalTarget = salesMetrics.sumOf { it.targetRevenue }
            val totalActual = salesMetrics.sumOf { it.actualRevenue }
            val overallPrc = if (totalTarget > 0) ((totalActual / totalTarget) * 100).toInt() else 0

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, GoldPrimary.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth().testTag("sales_aggregate_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "TOTAL REVENUE TARGETS (MONTHLY)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldPrimary,
                            letterSpacing = 1.sp
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = GoldPrimary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "$overallPrc% Attained",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldText,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Actual Revenue", fontSize = 11.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", totalActual)}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Target Benchmark", fontSize = 11.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", totalTarget)}", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { (totalActual / totalTarget).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = GoldPrimary,
                        trackColor = NavySurfaceVariant
                    )
                }
            }
        }

        // Department Selector Filter Chips
        item {
            Text(
                text = "Departmental Breakdown",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(departments) { dept ->
                    val isSelected = selectedDept.equals(dept, ignoreCase = true)
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedDept = dept },
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

        // Each Department's Sales Card
        val displayMetrics = if (selectedDept == "all") salesMetrics else salesMetrics.filter { it.department.equals(selectedDept, ignoreCase = true) }

        items(displayMetrics) { m ->
            val attainedPrc = ((m.actualRevenue / m.targetRevenue) * 100).toInt()

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("dept_card_${m.department.replace(" ", "_")}"),
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
                        Text(
                            text = m.department,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (attainedPrc >= 80) SuccessGreen.copy(alpha = 0.2f) else WarningOrange.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "$attainedPrc% of target",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (attainedPrc >= 80) SuccessGreen else WarningOrange,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = m.highlights,
                        fontSize = 12.sp,
                        color = TextSecondary,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { (m.actualRevenue / m.targetRevenue).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = GoldPrimary,
                        trackColor = NavySurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Actual", fontSize = 10.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", m.actualRevenue)}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = GoldText)
                        }
                        Column {
                            Text("Target", fontSize = 10.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", m.targetRevenue)}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                        }
                        Column {
                            Text("Conversion", fontSize = 10.sp, color = TextSecondary)
                            Text("${m.conversionRate}%", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        }
                        Column {
                            Text("Avg Order", fontSize = 10.sp, color = TextSecondary)
                            Text("$${m.avgOrderValue.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = NavyBorder.copy(alpha = 0.4f))
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Top Reps: ${m.topReps.joinToString(", ")}",
                            fontSize = 11.sp,
                            color = VioletLight
                        )
                        Text(
                            text = "${m.closedDealsCount} Closed / ${m.pipelineDealsCount} In Pipe",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }
            }
        }

        // Pipeline Leads for the Department
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "High-Value Pipeline Deals (${filteredLeads.size})",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        }

        items(filteredLeads) { lead ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("sales_lead_${lead.id}"),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariant),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = lead.customerName,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "${lead.department} · Rep: ${lead.repName}",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                        Text(
                            text = "$${lead.dealValue.toInt()}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = GoldText
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = lead.notes,
                        fontSize = 12.sp,
                        color = TextPrimary,
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StatusChip(status = lead.stage)

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (lead.stage != "Closed Won") {
                                OutlinedButton(
                                    onClick = {
                                        val nextStage = when (lead.stage) {
                                            "New Lead" -> "Consultation Scheduled"
                                            "Consultation Scheduled" -> "Proposal Sent"
                                            else -> "Closed Won"
                                        }
                                        viewModel.updateSalesLeadStage(lead.id, nextStage)
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Advance Stage →", fontSize = 11.sp, color = GoldPrimary)
                                }

                                Button(
                                    onClick = { viewModel.updateSalesLeadStage(lead.id, "Closed Won") },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Mark Won", fontSize = 11.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
