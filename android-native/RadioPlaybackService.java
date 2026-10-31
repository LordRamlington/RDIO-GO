package com.rdiogo.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

public class RadioPlaybackService extends Service {
    public static final String CHANNEL_ID = "rdio_go_stream_channel";
    public static final int NOTIFICATION_ID = 4040;

    public static final String ACTION_UPDATE = "com.rdiogo.app.action.UPDATE";
    public static final String ACTION_PLAY   = "com.rdiogo.app.action.PLAY";
    public static final String ACTION_PAUSE  = "com.rdiogo.app.action.PAUSE";
    public static final String ACTION_NEXT   = "com.rdiogo.app.action.NEXT";
    public static final String ACTION_PREV   = "com.rdiogo.app.action.PREV";
    public static final String ACTION_STOP   = "com.rdiogo.app.action.STOP";

    private MediaSession mediaSession;
    private PowerManager.WakeLock wakeLock;
    private WifiManager.WifiLock wifiLock;
    private String currentTitle = "RDIO-GO Radio";
    private String currentSubtitle = "Live Broadcast Streaming";
    private boolean isPlaying = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        initMediaSession();
        initLocks();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "RDIO-GO Radio Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active live radio playback controls in notification shade");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        mediaSession = new MediaSession(this, "RDIOGO_MediaSession");
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() {
                MainActivity.sendMediaActionToWeb("play");
                updateState(true);
            }

            @Override
            public void onPause() {
                MainActivity.sendMediaActionToWeb("pause");
                updateState(false);
            }

            @Override
            public void onSkipToNext() {
                MainActivity.sendMediaActionToWeb("next");
            }

            @Override
            public void onSkipToPrevious() {
                MainActivity.sendMediaActionToWeb("prev");
            }

            @Override
            public void onStop() {
                MainActivity.sendMediaActionToWeb("pause");
                updateState(false);
                stopForeground(false);
            }
        });
        mediaSession.setActive(true);
    }

    private void initLocks() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RDIOGO:RadioStreamWakeLock");
                wakeLock.setReferenceCounted(false);
            }

            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
            if (wm != null) {
                wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "RDIOGO:RadioStreamWifiLock");
                wifiLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void acquireLocks() {
        try {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12 hours safety timeout
            }
            if (wifiLock != null && !wifiLock.isHeld()) {
                wifiLock.acquire();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void releaseLocks() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_UPDATE.equals(action)) {
                String title = intent.getStringExtra("title");
                String subtitle = intent.getStringExtra("subtitle");
                boolean playing = intent.getBooleanExtra("isPlaying", false);
                if (title != null && !title.isEmpty()) currentTitle = title;
                if (subtitle != null && !subtitle.isEmpty()) currentSubtitle = subtitle;
                isPlaying = playing;
                updateNotificationAndForeground();
            } else if (ACTION_PLAY.equals(action)) {
                MainActivity.sendMediaActionToWeb("play");
                isPlaying = true;
                updateNotificationAndForeground();
            } else if (ACTION_PAUSE.equals(action)) {
                MainActivity.sendMediaActionToWeb("pause");
                isPlaying = false;
                updateNotificationAndForeground();
            } else if (ACTION_NEXT.equals(action)) {
                MainActivity.sendMediaActionToWeb("next");
            } else if (ACTION_PREV.equals(action)) {
                MainActivity.sendMediaActionToWeb("prev");
            } else if (ACTION_STOP.equals(action)) {
                isPlaying = false;
                releaseLocks();
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }
        }
        return START_STICKY;
    }

    private void updateState(boolean playing) {
        isPlaying = playing;
        updateNotificationAndForeground();
    }

    private void updateNotificationAndForeground() {
        if (isPlaying) {
            acquireLocks();
        } else {
            releaseLocks();
        }

        // Update MediaSession PlaybackState
        if (mediaSession != null) {
            int state = isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
            PlaybackState.Builder pb = new PlaybackState.Builder()
                .setActions(
                    PlaybackState.ACTION_PLAY |
                    PlaybackState.ACTION_PAUSE |
                    PlaybackState.ACTION_SKIP_TO_NEXT |
                    PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                    PlaybackState.ACTION_STOP
                )
                .setState(state, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1.0f);
            mediaSession.setPlaybackState(pb.build());
        }

        Notification notification = buildNotification();

        if (isPlaying) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } else {
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    private Notification buildNotification() {
        int pIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        // Tap notification to open app
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pOpenApp = PendingIntent.getActivity(this, 0, openAppIntent, pIntentFlags);

        // Previous Action Intent
        Intent prevIntent = new Intent(this, RadioPlaybackService.class);
        prevIntent.setAction(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getService(this, 1, prevIntent, pIntentFlags);

        // Play/Pause Action Intent
        Intent playPauseIntent = new Intent(this, RadioPlaybackService.class);
        playPauseIntent.setAction(isPlaying ? ACTION_PAUSE : ACTION_PLAY);
        PendingIntent pPlayPause = PendingIntent.getService(this, 2, playPauseIntent, pIntentFlags);

        // Next Action Intent
        Intent nextIntent = new Intent(this, RadioPlaybackService.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(this, 3, nextIntent, pIntentFlags);

        // App Icon for small icon
        int smallIcon = getApplicationInfo().icon != 0 ? getApplicationInfo().icon : android.R.drawable.ic_media_play;

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        builder.setContentTitle(currentTitle)
               .setContentText(currentSubtitle)
               .setSmallIcon(smallIcon)
               .setContentIntent(pOpenApp)
               .setVisibility(Notification.VISIBILITY_PUBLIC)
               .setOngoing(isPlaying);

        // Add media buttons: Previous, Play/Pause, Next
        builder.addAction(android.R.drawable.ic_media_previous, "Previous", pPrev);
        if (isPlaying) {
            builder.addAction(android.R.drawable.ic_media_pause, "Pause", pPlayPause);
        } else {
            builder.addAction(android.R.drawable.ic_media_play, "Play", pPlayPause);
        }
        builder.addAction(android.R.drawable.ic_media_next, "Next", pNext);

        // Apply MediaStyle for Android Notification Shade & Lockscreen
        Notification.MediaStyle mediaStyle = new Notification.MediaStyle();
        if (mediaSession != null) {
            mediaStyle.setMediaSession(mediaSession.getSessionToken());
        }
        mediaStyle.setShowActionsInCompactView(0, 1, 2);
        builder.setStyle(mediaStyle);

        return builder.build();
    }

    @Override
    public void onDestroy() {
        releaseLocks();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
