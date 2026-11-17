package in.wardmate.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Must run before super.onCreate(), which is what actually builds the bridge.
        registerPlugin(RecordingServicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
