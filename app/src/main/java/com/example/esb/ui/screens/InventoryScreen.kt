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
import com.example.esb.data.model.InventoryItem
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    viewModel: EsbViewModel
) {
    val inventory by viewModel.filteredInventory.collectAsState()
    val categoryFilter by viewModel.inventoryCategoryFilter.collectAsState()
    val onlyLowStock by viewModel.inventoryOnlyLowStock.collectAsState()

    var selectedItemForRestock by remember { mutableStateOf<InventoryItem?>(null) }
    var restockAmountInput by remember { mutableStateOf("20") }

    val categories = listOf("all", "Serum", "Cleanser", "Cream", "SPF", "Clinical")

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
                Text(
                    text = "Inventory & Stock Levels",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Real-time SKU quantities, thresholds and automated restock orders",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Low stock warning banner if any item is below threshold
        val lowStockCount = inventory.count { it.qty <= it.lowStockThreshold }
        if (lowStockCount > 0) {
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = WarningOrange.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, WarningOrange.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Alert",
                            tint = WarningOrange,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "$lowStockCount SKUs Below Threshold",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = "Automated purchase requests prepared. Tap item to replenish stock.",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }

        // Category Filter Tabs
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(categories) { cat ->
                        val isSelected = categoryFilter.equals(cat, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { viewModel.setInventoryCategory(cat) },
                            label = {
                                Text(
                                    text = if (cat == "all") "All Categories" else cat,
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

                // Low stock toggle
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clickable { viewModel.toggleInventoryLowStock(!onlyLowStock) }
                        .padding(vertical = 4.dp)
                ) {
                    Checkbox(
                        checked = onlyLowStock,
                        onCheckedChange = { viewModel.toggleInventoryLowStock(it) },
                        colors = CheckboxDefaults.colors(
                            checkedColor = GoldPrimary,
                            checkmarkColor = NavyBackground,
                            uncheckedColor = TextSecondary
                        )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Show only low stock items",
                        fontSize = 12.sp,
                        color = if (onlyLowStock) GoldPrimary else TextSecondary
                    )
                }
            }
        }

        // Inventory Items List
        items(inventory) { item ->
            val isLow = item.qty <= item.lowStockThreshold
            val progress = (item.qty.toFloat() / 50f).coerceIn(0f, 1f)
            val barColor = when {
                item.qty <= item.lowStockThreshold -> DangerRed
                item.qty <= 25 -> WarningOrange
                else -> SuccessGreen
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("inventory_item_${item.id}"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyCard),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isLow) DangerRed.copy(alpha = 0.5f) else NavyBorder)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.brand,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = GoldPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = item.name,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "SKU: ${item.sku} · ${item.category}",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${item.qty} units",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isLow) DangerRed else TextPrimary
                            )
                            Text(
                                text = "Min: ${item.lowStockThreshold}",
                                fontSize = 10.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Quantity visual bar
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = barColor,
                        trackColor = NavySurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "$${item.unitPrice.toInt()} / unit",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { viewModel.restockItem(item.id, 10) },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("+10 Restock", fontSize = 11.sp, color = GoldPrimary)
                            }

                            Button(
                                onClick = {
                                    selectedItemForRestock = item
                                    restockAmountInput = "25"
                                },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Custom Restock", fontSize = 11.sp, color = NavyBackground, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }

    // Custom Restock Dialog
    selectedItemForRestock?.let { targetItem ->
        AlertDialog(
            onDismissRequest = { selectedItemForRestock = null },
            containerColor = NavySurfaceVariant,
            title = {
                Text("Replenish Stock", fontWeight = FontWeight.Bold, color = TextPrimary)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "${targetItem.brand} — ${targetItem.name}",
                        color = TextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "Current: ${targetItem.qty} units (Threshold: ${targetItem.lowStockThreshold})",
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = restockAmountInput,
                        onValueChange = { restockAmountInput = it },
                        label = { Text("Units to Add") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val added = restockAmountInput.toIntOrNull() ?: 10
                        viewModel.restockItem(targetItem.id, added)
                        selectedItemForRestock = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary)
                ) {
                    Text("Confirm Restock", color = NavyBackground, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedItemForRestock = null }) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}
