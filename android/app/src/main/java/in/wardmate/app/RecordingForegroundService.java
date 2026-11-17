package in.wardmate.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Exists for one reason: Android suspends the WebView's getUserMedia mic stream the moment the
 * app leaves the foreground (screen lock, home button, another app on top). A foreground service
 * of type "microphone" is the only way to keep the process — and the recording inside it — alive
 * through that. It does no recording itself; it only holds the persistent notification Android
 * requires while a foreground service is running.
 *
 * Started/stopped from the web app via RecordingServicePlugin, bracketing each dictation
 * (`lib/use-dictation.ts` and `lib/stt/live.ts`) — never left running outside of one.
 */
public class RecordingForegroundService extends Service {

    private static final String CHANNEL_ID = "wardmate_recording";
    private static final int NOTIFICATION_ID = 4287;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("WardMate is recording")
            .setContentText("Dictation continues while the screen is locked.")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        // START_NOT_STICKY: if the OS kills the process under memory pressure, it should not
        // resurrect this service with no recording to back it — the web app restarts it itself
        // on the next dictation.
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Recording",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shown while WardMate is recording dictation in the background.");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
