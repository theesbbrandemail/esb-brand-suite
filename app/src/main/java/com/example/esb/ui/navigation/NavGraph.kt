package com.example.esb.ui.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.esb.ui.components.EsbBottomBar
import com.example.esb.ui.components.EsbTopAppBar
import com.example.esb.ui.components.QuickNavTabs
import com.example.esb.ui.screens.*
import com.example.esb.ui.theme.NavyBackground
import com.example.esb.ui.viewmodel.EsbViewModel

@Composable
fun EsbNavHost(
    viewModel: EsbViewModel = viewModel()
) {
    var currentScreen by remember { mutableStateOf("overview") }
    val branches = viewModel.branches
    val selectedBranchId by viewModel.selectedBranchId.collectAsState()

    // Handle back button on secondary screens
    if (currentScreen != "overview") {
        BackHandler {
            currentScreen = "overview"
        }
    }

    Scaffold(
        containerColor = NavyBackground,
        topBar = {
            Column {
                EsbTopAppBar(
                    branches = branches,
                    selectedBranchId = selectedBranchId,
                    onBranchSelected = { viewModel.switchBranch(it) },
                    onAiOrchestratorClick = { currentScreen = "ceo" }
                )
                QuickNavTabs(
                    currentScreen = currentScreen,
                    onNavigate = { currentScreen = it }
                )
            }
        },
        bottomBar = {
            EsbBottomBar(
                currentScreen = currentScreen,
                onNavigate = { currentScreen = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(NavyBackground)
        ) {
            when (currentScreen) {
                "overview" -> OverviewScreen(
                    viewModel = viewModel,
                    onNavigate = { currentScreen = it }
                )
                "sales" -> SalesDashboardScreen(
                    viewModel = viewModel
                )
                "followups" -> CustomerFollowUpScreen(
                    viewModel = viewModel
                )
                "clinical" -> ClinicalSuiteScreen(
                    viewModel = viewModel
                )
                "manager" -> ManagerSuiteScreen(
                    viewModel = viewModel,
                    onNavigate = { currentScreen = it }
                )
                "appointments" -> AppointmentsScreen(
                    viewModel = viewModel
                )
                "inventory" -> InventoryScreen(
                    viewModel = viewModel
                )
                "ceo" -> CeoOrchestratorScreen(
                    viewModel = viewModel
                )
                "brands" -> SubBrandsScreen(
                    viewModel = viewModel
                )
                "crm" -> CrmScreen(
                    viewModel = viewModel
                )
                else -> OverviewScreen(
                    viewModel = viewModel,
                    onNavigate = { currentScreen = it }
                )
            }
        }
    }
}
