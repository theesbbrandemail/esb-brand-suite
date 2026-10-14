package com.example.esb.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.data.model.Branch
import com.example.esb.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EsbTopAppBar(
    branches: List<Branch>,
    selectedBranchId: String,
    onBranchSelected: (String) -> Unit,
    onAiOrchestratorClick: () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val currentBranch = branches.find { it.id == selectedBranchId } ?: branches.firstOrNull()

    TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = NavyBackground,
            titleContentColor = TextPrimary
        ),
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(start = 4.dp)
            ) {
                // Gold crown emblem
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(listOf(GoldPrimary, GoldDark))
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "ESB",
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        color = NavyBackground
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "ESB Brand",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "Suite & Operations",
                        fontSize = 10.sp,
                        color = TextSecondary
                    )
                }
            }
        },
        actions = {
            // Branch Switcher dropdown
            Box {
                Surface(
                    onClick = { expanded = true },
                    shape = RoundedCornerShape(20.dp),
                    color = NavySurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, NavyBorder),
                    modifier = Modifier
                        .testTag("branch_selector_button")
                        .padding(end = 8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Branch",
                            tint = GoldPrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = currentBranch?.name ?: "Branch",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowDropDown,
                            contentDescription = "Select",
                            tint = TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.background(NavySurfaceVariant)
                ) {
                    branches.forEach { b ->
                        DropdownMenuItem(
                            text = {
                                Text(
                                    text = "${b.name} (${b.city})",
                                    color = if (b.id == selectedBranchId) GoldPrimary else TextPrimary,
                                    fontWeight = if (b.id == selectedBranchId) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            onClick = {
                                onBranchSelected(b.id)
                                expanded = false
                            }
                        )
                    }
                }
            }

            // AI Status live pill
            Surface(
                onClick = onAiOrchestratorClick,
                shape = RoundedCornerShape(20.dp),
                color = VioletAccent.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, VioletAccent.copy(alpha = 0.4f)),
                modifier = Modifier
                    .testTag("ai_orchestrator_pill")
                    .padding(end = 12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(VioletAccent)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "CEO AI",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = VioletLight
                    )
                }
            }
        }
    )
}

@Composable
fun QuickNavTabs(
    currentScreen: String,
    onNavigate: (String) -> Unit
) {
    val quickRoutes = listOf(
        Pair("overview", "Overview"),
        Pair("sales", "Sales Team"),
        Pair("followups", "Follow-ups"),
        Pair("clinical", "Doctor & Nurse"),
        Pair("manager", "Manager Suite"),
        Pair("appointments", "Appointments"),
        Pair("inventory", "Inventory"),
        Pair("ceo", "CEO AI"),
        Pair("brands", "Sub-Brands"),
        Pair("crm", "Patients")
    )

    Surface(
        color = NavyBackground,
        modifier = Modifier.fillMaxWidth()
    ) {
        LazyRow(
            modifier = Modifier
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(quickRoutes) { (route, title) ->
                val isSelected = currentScreen == route
                Surface(
                    onClick = { onNavigate(route) },
                    shape = RoundedCornerShape(16.dp),
                    color = if (isSelected) GoldPrimary else NavySurface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) GoldPrimary else NavyBorder)
                ) {
                    Text(
                        text = title,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) NavyBackground else TextSecondary,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EsbBottomBar(
    currentScreen: String,
    onNavigate: (String) -> Unit
) {
    NavigationBar(
        containerColor = NavySurface,
        tonalElevation = 8.dp,
        modifier = Modifier.testTag("bottom_nav_bar")
    ) {
        val items = listOf(
            Triple("overview", "Overview", Icons.Default.Dashboard),
            Triple("sales", "Sales", Icons.Default.TrendingUp),
            Triple("followups", "Follow-up", Icons.Default.MarkChatRead),
            Triple("clinical", "Clinical", Icons.Default.MedicalServices),
            Triple("manager", "Manager", Icons.Default.SupervisorAccount)
        )

        items.forEach { (route, label, icon) ->
            val selected = currentScreen == route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(route) },
                icon = {
                    Icon(
                        imageVector = icon,
                        contentDescription = label,
                        modifier = Modifier.size(20.dp)
                    )
                },
                label = {
                    Text(
                        text = label,
                        fontSize = 10.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = NavyBackground,
                    indicatorColor = GoldPrimary,
                    selectedTextColor = GoldPrimary,
                    unselectedIconColor = TextSecondary,
                    unselectedTextColor = TextSecondary
                )
            )
        }
    }
}

@Composable
fun StatusChip(
    status: String,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status.lowercase()) {
        "confirmed", "completed", "approved", "closed won", "prep ready", "on duty" -> Pair(SuccessGreen.copy(alpha = 0.2f), SuccessGreen)
        "scheduled", "auto", "gold", "high" -> Pair(GoldPrimary.copy(alpha = 0.2f), GoldLight)
        "pending", "awaiting", "in queue", "proposal sent" -> Pair(VioletAccent.copy(alpha = 0.2f), VioletLight)
        "cancelled", "rejected" -> Pair(DangerRed.copy(alpha = 0.2f), DangerRed)
        else -> Pair(NavySurfaceVariant, TextSecondary)
    }

    Surface(
        shape = RoundedCornerShape(12.dp),
        color = bgColor,
        modifier = modifier
    ) {
        Text(
            text = status.replaceFirstChar { it.uppercase() },
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun SparklineChart(
    points: List<Float> = listOf(20f, 28f, 24f, 35f, 42f, 38f, 55f, 60f, 72f),
    modifier: Modifier = Modifier
        .fillMaxWidth()
        .height(60.dp)
) {
    Canvas(modifier = modifier) {
        if (points.size < 2) return@Canvas

        val maxVal = points.maxOrNull() ?: 1f
        val minVal = points.minOrNull() ?: 0f
        val range = if (maxVal == minVal) 1f else maxVal - minVal

        val stepX = size.width / (points.size - 1)
        val path = Path()

        points.forEachIndexed { i, p ->
            val x = i * stepX
            val norm = (p - minVal) / range
            val y = size.height - (norm * (size.height * 0.8f)) - (size.height * 0.1f)

            if (i == 0) {
                path.moveTo(x, y)
            } else {
                path.lineTo(x, y)
            }
        }

        drawPath(
            path = path,
            color = GoldPrimary,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}
