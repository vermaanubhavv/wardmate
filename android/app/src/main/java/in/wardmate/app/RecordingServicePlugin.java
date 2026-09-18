package in.wardmate.app;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * The web-to-native bridge for RecordingForegroundService. Two calls, `start` and `stop`,
 * bracketing a dictation — see `lib/native/recording-service.ts` for the JS side, which no-ops
 * on iOS and the browser (this plugin only exists in the Android project).
 */
@CapacitorPlugin(
    name = "RecordingService",
    permissions = { @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications") }
)
public class RecordingServicePlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        // POST_NOTIFICATIONS (API 33+) only gates whether the required notification is visible —
        // a foreground service starts fine without it — so this is best-effort, not a gate on
        // starting the service below.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "startAfterPermissionCheck");
            return;
        }
        startService(call);
    }

    @PermissionCallback
    private void startAfterPermissionCheck(PluginCall call) {
        startService(call);
    }

    private void startService(PluginCall call) {
        Intent intent = new Intent(getContext(), RecordingForegroundService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getContext().stopService(new Intent(getContext(), RecordingForegroundService.class));
        call.resolve();
    }
}
