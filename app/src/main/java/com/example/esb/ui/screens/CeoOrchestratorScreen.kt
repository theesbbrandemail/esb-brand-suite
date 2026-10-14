package com.example.esb.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.ui.components.StatusChip
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@Composable
fun CeoOrchestratorScreen(
    viewModel: EsbViewModel
) {
    val automationTasks by viewModel.automationTasks.collectAsState()
    val chatMessages by viewModel.chatMessages.collectAsState()
    val kpis = viewModel.getCeoKpis()

    var promptInput by remember { mutableStateOf("") }

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
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = VioletLight,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "CEO AI Orchestrator",
                        color = TextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Autonomous operational intelligence, approvals & executive financial tracking",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Executive Financial KPI Highlights
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "EXECUTIVE FINANCIALS (30D)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldPrimary,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Revenue", fontSize = 11.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", kpis.revenue30d)}", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = GoldText)
                            Text("+${kpis.revenueGrowth}% MoM", fontSize = 11.sp, color = SuccessGreen)
                        }
                        Column {
                            Text("Net Profit", fontSize = 11.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", kpis.profit30d)}", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("${kpis.margin30d}% Margin", fontSize = 11.sp, color = GoldPrimary)
                        }
                        Column {
                            Text("CSAT / NPS", fontSize = 11.sp, color = TextSecondary)
                            Text("${kpis.csatPercent}%", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text("+${kpis.nps} NPS", fontSize = 11.sp, color = VioletLight)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = NavyBorder.copy(alpha = 0.5f))
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "AI Autonomy Engine",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = VioletAccent.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "${kpis.aiAutonomy}% Tasks Auto-Run",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = VioletLight,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }
            }
        }

        // AI Automation Approvals Queue
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Automation Approval Queue",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${kpis.pendingApprovals} Pending",
                    fontSize = 12.sp,
                    color = VioletLight
                )
            }
        }

        items(automationTasks) { task ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("orchestrator_approval_${task.id}"),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (task.status == "pending") VioletAccent.copy(alpha = 0.4f) else NavyBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = task.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            modifier = Modifier.weight(1f)
                        )
                        StatusChip(status = task.status)
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${task.branchName} · ${task.category} · ${task.timestamp}",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = task.description,
                        fontSize = 12.sp,
                        color = TextPrimary,
                        lineHeight = 16.sp
                    )

                    if (task.status == "pending") {
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedButton(
                                onClick = { viewModel.rejectTask(task.id) },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Reject", fontSize = 11.sp, color = DangerRed)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = { viewModel.approveTask(task.id) },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Approve & Execute", fontSize = 11.sp, color = NavyBackground, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // Branch Profitability Breakdown
        item {
            Text(
                text = "Branch Profitability Breakdown",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        items(kpis.branchProfit) { bp ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${bp.name} (${bp.city})",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = GoldPrimary.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "${bp.margin}% Margin",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldLight,
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
                            Text("Revenue", fontSize = 10.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", bp.revenue)}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                        Column {
                            Text("Operational Cost", fontSize = 10.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", bp.cost)}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                        }
                        Column {
                            Text("Net Profit", fontSize = 10.sp, color = TextSecondary)
                            Text("$${String.format("%,.0f", bp.profit)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                        }
                        Column {
                            Text("Avg Ticket", fontSize = 10.sp, color = TextSecondary)
                            Text("$${bp.avgTicket.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = GoldText)
                        }
                    }
                }
            }
        }

        // Executive AI Assistant Dialogue Box
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavySurfaceVariant),
                border = androidx.compose.foundation.BorderStroke(1.dp, VioletAccent.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.SmartToy, contentDescription = null, tint = VioletLight, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Executive Strategy Assistant", fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    chatMessages.forEach { msg ->
                        val isAi = msg.sender == "ceo_ai"
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isAi) NavyCard else VioletAccent.copy(alpha = 0.25f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = if (isAi) "ESB Orchestrator" else "You",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isAi) GoldPrimary else VioletLight
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(text = msg.text, fontSize = 12.sp, color = TextPrimary, lineHeight = 16.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Quick prompt chips
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        SuggestionChip(
                            onClick = { viewModel.sendCeoAiPrompt("Optimize Wednesday staffing") },
                            label = { Text("Staffing", fontSize = 11.sp) }
                        )
                        SuggestionChip(
                            onClick = { viewModel.sendCeoAiPrompt("Restock forecast for serums") },
                            label = { Text("Restock", fontSize = 11.sp) }
                        )
                        SuggestionChip(
                            onClick = { viewModel.sendCeoAiPrompt("30-day revenue growth") },
                            label = { Text("Revenue", fontSize = 11.sp) }
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Input field & Send button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = promptInput,
                            onValueChange = { promptInput = it },
                            placeholder = { Text("Ask orchestrator a command...", fontSize = 12.sp, color = TextSecondary) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("ceo_prompt_input"),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = {
                                if (promptInput.isNotBlank()) {
                                    viewModel.sendCeoAiPrompt(promptInput)
                                    promptInput = ""
                                }
                            },
                            modifier = Modifier
                                .size(42.dp)
                                .background(GoldPrimary, RoundedCornerShape(12.dp))
                                .testTag("ceo_prompt_send_button")
                        ) {
                            Icon(imageVector = Icons.Default.Send, contentDescription = "Send", tint = NavyBackground, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}
