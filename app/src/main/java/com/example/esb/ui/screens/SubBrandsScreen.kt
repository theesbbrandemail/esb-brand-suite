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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.esb.ui.theme.*
import com.example.esb.ui.viewmodel.EsbViewModel

@Composable
fun SubBrandsScreen(
    viewModel: EsbViewModel
) {
    val subBrands by viewModel.subBrands.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Category, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Sub-Brands Portfolio", color = TextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Artisanal Skincare Kitchen, Derma Aesthetics clinics, and ESB Apothecary", color = TextSecondary, fontSize = 12.sp)
            }
        }

        items(subBrands) { b ->
            Card(
                modifier = Modifier.fillMaxWidth(),
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
                        Text(text = b.name, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Text(text = b.growthPercent, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = if (b.isGold) GoldPrimary else VioletLight)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = b.tagline, fontSize = 12.sp, color = TextSecondary)

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "Monthly Performance: ${b.monthlyRevenue} (${b.sharePercent}% suite share)", fontSize = 12.sp, color = TextPrimary, fontWeight = FontWeight.SemiBold)

                    Spacer(modifier = Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { b.sharePercent / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = if (b.isGold) GoldPrimary else VioletAccent,
                        trackColor = NavySurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Flagship Formulations & Services:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = GoldLight)
                    Spacer(modifier = Modifier.height(4.dp))
                    b.topOfferings.forEach { off ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = off, fontSize = 12.sp, color = TextPrimary)
                        }
                    }
                }
            }
        }
    }
}
