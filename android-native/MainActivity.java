package com.rdiogo.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity instance;
    private Handler keepAliveHandler = new Handler(Looper.getMainLooper());
    private Runnable keepAliveRunnable = new Runnable() {
        @Override
        public void run() {
            try {
                if (instance != null && instance.getBridge() != null && instance.getBridge().getWebView() != null) {
                    instance.getBridge().getWebView().evaluateJavascript(
                        "if (typeof window !== 'undefined' && window.keepAudioAlive) { window.keepAudioAlive(); }",
                        null
                    );
                }
            } catch (Throwable t) {
                // Ignore background heartbeat notice
            }
            if (keepAliveHandler != null) {
                keepAliveHandler.postDelayed(this, 10000);
            }
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;
        registerWebBridge();
        requestNotificationPermission();
        startKeepAliveHeartbeat();
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
        requestNotificationPermission();
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().resumeTimers();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            requestNotificationPermission();
        }
    }

    private void startKeepAliveHeartbeat() {
        try {
            if (keepAliveHandler != null) {
                keepAliveHandler.removeCallbacks(keepAliveRunnable);
                keepAliveHandler.postDelayed(keepAliveRunnable, 10000);
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    public void requestNotificationPermission() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
                }
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    private void registerWebBridge() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
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
                                    if (isPlaying && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                        startForegroundService(intent);
                                    } else {
                                        startService(intent);
                                    }
                                } catch (Throwable t) {
                                    t.printStackTrace();
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
                                } catch (Throwable t) {
                                    t.printStackTrace();
                                }
                            }
                        });
                    }

                    @JavascriptInterface
                    public void requestPermission() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                requestNotificationPermission();
                            }
                        });
                    }

                    @JavascriptInterface
                    public boolean isBatteryOptimizationIgnored() {
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                                if (pm != null) {
                                    return pm.isIgnoringBatteryOptimizations(getPackageName());
                                }
                            }
                        } catch (Throwable t) {
                            t.printStackTrace();
                        }
                        return true;
                    }

                    @JavascriptInterface
                    public void requestIgnoreBatteryOptimization() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                                        if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                                            Intent intent = new Intent();
                                            intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                                            intent.setData(Uri.parse("package:" + getPackageName()));
                                            startActivity(intent);
                                            return;
                                        }
                                    }
                                } catch (Throwable t) {
                                    try {
                                        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                        intent.setData(Uri.parse("package:" + getPackageName()));
                                        startActivity(intent);
                                    } catch (Throwable t2) {
                                        try {
                                            Intent intent2 = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                                            startActivity(intent2);
                                        } catch (Throwable t3) {
                                            t3.printStackTrace();
                                        }
                                    }
                                }
                            }
                        });
                    }

                    @JavascriptInterface
                    public void openAppDetailsSettings() {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                                    intent.setData(Uri.parse("package:" + getPackageName()));
                                    startActivity(intent);
                                } catch (Throwable t) {
                                    t.printStackTrace();
                                }
                            }
                        });
                    }
                }, "AndroidRadioBridge");
            }
        } catch (Throwable t) {
            t.printStackTrace();
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
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                }
            });
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView audio decoding and timers active in background
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.onResume();
                webView.resumeTimers();
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        // Keep WebView active during screen lock
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.onResume();
                webView.resumeTimers();
            }
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        if (keepAliveHandler != null) {
            keepAliveHandler.removeCallbacksAndMessages(null);
            keepAliveHandler = null;
        }
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }
}
