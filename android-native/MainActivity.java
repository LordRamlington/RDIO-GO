package com.rdiogo.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity instance;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;
        requestNotificationPermission();
    }

    @Override
    public void onStart() {
        super.onStart();
        instance = this;
        registerWebBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        instance = this;
        registerWebBridge();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().resumeTimers();
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }
    }

    private void registerWebBridge() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void updatePlayback(final String title, final String subtitle, final boolean isPlaying) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Intent intent = new Intent(MainActivity.this, RadioPlaybackService.class);
                                intent.setAction(RadioPlaybackService.ACTION_UPDATE);
                                intent.putExtra("title", title);
                                intent.putExtra("subtitle", subtitle);
                                intent.putExtra("isPlaying", isPlaying);
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    startForegroundService(intent);
                                } else {
                                    startService(intent);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }

                @JavascriptInterface
                public void stopPlaybackService() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                Intent intent = new Intent(MainActivity.this, RadioPlaybackService.class);
                                intent.setAction(RadioPlaybackService.ACTION_STOP);
                                startService(intent);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }, "AndroidRadioBridge");
        }
    }

    public static void sendMediaActionToWeb(final String action) {
        if (instance != null) {
            instance.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (instance.getBridge() != null && instance.getBridge().getWebView() != null) {
                            String js = "if (typeof window !== 'undefined' && window.onNativeMediaAction) { window.onNativeMediaAction('" + action + "'); }";
                            instance.getBridge().getWebView().evaluateJavascript(js, null);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView audio decoding and timers active in background
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        // Keep WebView active during screen lock
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    public void onDestroy() {
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }
}
