package com.example.esb

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.esb.ui.navigation.EsbNavHost
import com.example.esb.ui.theme.ESBBrandTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ESBBrandTheme {
                EsbNavHost()
            }
        }
    }
}
