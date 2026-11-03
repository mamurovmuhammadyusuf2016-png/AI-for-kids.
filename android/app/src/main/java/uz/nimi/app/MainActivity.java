package uz.nimi.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.ComponentActivity;
import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.browser.customtabs.CustomTabsIntent;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.Locale;

/** The whole app: the Nimi site in a WebView plus a few phone features the page asks for. */
public class MainActivity extends ComponentActivity {
    static final String SITE = "https://nimi-ai.onrender.com";
    static final String HOST = "nimi-ai.onrender.com";
    // Languages the site reads aloud (word cards: 17 languages).
    static final String[] TTS_LANGS = {"ru-RU", "uz-UZ", "en-US", "es-ES", "fr-FR", "de-DE", "zh-CN", "ja-JP", "ko-KR",
            "ar-SA", "tr-TR", "it-IT", "pt-BR", "hi-IN", "nl-NL", "pl-PL", "sv-SE"};

    private FrameLayout root;
    private WebView web;
    private View offline;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;
    private TextToSpeech tts;
    private boolean ttsReady;
    private ActivityResultLauncher<Intent> filePicker;
    private ActivityResultLauncher<Intent> voicePicker;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        root = new FrameLayout(this);
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        // The page stays clear of the status bar, the navigation bar and the keyboard.
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        applyTheme(isSystemDark() ? "dark" : "light");

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " NimiAndroid/" + BuildConfig.VERSION_NAME);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.addJavascriptInterface(new Bridge(), "NimiAndroid");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());

        filePicker = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), r -> {
            if (fileCallback == null) return;
            Uri[] picked = WebChromeClient.FileChooserParams.parseResult(r.getResultCode(), r.getData());
            if (picked == null && r.getResultCode() == RESULT_OK && cameraUri != null && cameraFileHasPhoto()) picked = new Uri[]{cameraUri};
            fileCallback.onReceiveValue(picked);
            fileCallback = null;
        });
        voicePicker = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), r -> {
            String said = null;
            if (r.getResultCode() == RESULT_OK && r.getData() != null) {
                ArrayList<String> list = r.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (list != null && !list.isEmpty()) said = list.get(0);
            }
            callPage("window.NimiVoiceResult && NimiVoiceResult(" + (said == null ? "null" : JSONObject.quote(said)) + ")");
        });

        tts = new TextToSpeech(this, status -> ttsReady = status == TextToSpeech.SUCCESS);
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override public void onStart(String id) {}
            @Override public void onDone(String id) { callPage("window.NimiSpeakDone && NimiSpeakDone()"); }
            @Override public void onError(String id) { callPage("window.NimiSpeakDone && NimiSpeakDone()"); }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (offline != null) { finish(); return; }
                // The page closes its own screens first (window.NimiBack in app.js).
                web.evaluateJavascript("window.NimiBack ? String(window.NimiBack()) : 'false'", v -> {
                    if ("\"true\"".equals(v)) return;
                    if (web.canGoBack()) web.goBack();
                    else finish();
                });
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else if (!openFromIntent(getIntent())) web.loadUrl(SITE + "/?source=android");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        openFromIntent(intent);
    }

    /** nimi://auth?code=... after Google sign-in, or a link to the site. */
    private boolean openFromIntent(Intent intent) {
        Uri uri = intent == null ? null : intent.getData();
        if (uri == null) return false;
        if ("nimi".equals(uri.getScheme()) && "auth".equals(uri.getHost())) {
            String code = uri.getQueryParameter("code");
            web.loadUrl(SITE + "/api/auth/app-exchange?code=" + Uri.encode(code == null ? "" : code));
            return true;
        }
        if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) {
            web.loadUrl(uri.toString());
            return true;
        }
        return false;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }

    private boolean isSystemDark() {
        return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    }

    /** Bars match the site's theme: black for dark, white for light. */
    private void applyTheme(String theme) {
        boolean light = !"dark".equals(theme);
        root.setBackgroundColor(light ? Color.WHITE : Color.BLACK);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), root);
        c.setAppearanceLightStatusBars(light);
        c.setAppearanceLightNavigationBars(light);
    }

    private void callPage(String js) {
        runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    private boolean cameraFileHasPhoto() {
        File f = new File(new File(getCacheDir(), "camera"), "photo.jpg");
        return f.exists() && f.length() > 0;
    }

    private void openOutside(Uri uri) {
        try {
            Intent i = "intent".equals(uri.getScheme()) ? Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME) : new Intent(Intent.ACTION_VIEW, uri);
            i.addCategory(Intent.CATEGORY_BROWSABLE);
            i.setComponent(null);
            i.setSelector(null);
            startActivity(i);
        } catch (Exception ignored) {
            // No app can open it (for example tel: on a tablet).
        }
    }

    private void showOffline(boolean show) {
        if (show && offline == null) {
            LinearLayout box = new LinearLayout(this);
            box.setOrientation(LinearLayout.VERTICAL);
            box.setGravity(Gravity.CENTER);
            box.setPadding(64, 64, 64, 64);
            box.setBackgroundColor(Color.WHITE);
            TextView title = new TextView(this);
            title.setText(R.string.offline_title);
            title.setTextSize(22);
            title.setTextColor(Color.BLACK);
            title.setGravity(Gravity.CENTER);
            TextView text = new TextView(this);
            text.setText(R.string.offline_text);
            text.setTextSize(16);
            text.setTextColor(Color.DKGRAY);
            text.setGravity(Gravity.CENTER);
            text.setPadding(0, 24, 0, 48);
            Button retry = new Button(this);
            retry.setText(R.string.retry);
            retry.setOnClickListener(v -> { showOffline(false); web.reload(); });
            box.addView(title);
            box.addView(text);
            box.addView(retry);
            offline = box;
            root.addView(offline, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        } else if (!show && offline != null) {
            root.removeView(offline);
            offline = null;
        }
    }

    private class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())) return false;
            openOutside(uri); // Telegram, phone calls, other sites
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) showOffline(true);
        }
    }

    private class Chrome extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = callback;
            Intent chooser = Intent.createChooser(params.createIntent(), null);
            // "Photo of a task": the camera is offered next to the gallery.
            try {
                File dir = new File(getCacheDir(), "camera");
                //noinspection ResultOfMethodCallIgnored
                dir.mkdirs();
                File photo = new File(dir, "photo.jpg");
                //noinspection ResultOfMethodCallIgnored
                photo.delete();
                cameraUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", photo);
                Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                camera.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                camera.setClipData(ClipData.newRawUri("", cameraUri));
                camera.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{camera});
            } catch (Exception e) {
                cameraUri = null;
            }
            try {
                filePicker.launch(chooser);
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                return false;
            }
            return true;
        }
    }

    /** window.NimiAndroid in the page. Called on a background thread. */
    private class Bridge {
        @JavascriptInterface
        public void googleLogin(String lang) {
            Uri uri = Uri.parse(SITE + "/app-login.html?lang=" + ("uz".equals(lang) ? "uz" : "ru"));
            runOnUiThread(() -> {
                try {
                    new CustomTabsIntent.Builder().build().launchUrl(MainActivity.this, uri);
                } catch (Exception e) {
                    openOutside(uri);
                }
            });
        }

        @JavascriptInterface
        public boolean speak(String text, String langTag) {
            if (!ttsReady) return false;
            Locale locale = Locale.forLanguageTag(langTag);
            if (tts.isLanguageAvailable(locale) < TextToSpeech.LANG_AVAILABLE) return false;
            tts.setLanguage(locale);
            tts.setSpeechRate(0.95f);
            return tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "nimi") == TextToSpeech.SUCCESS;
        }

        @JavascriptInterface
        public void stop() {
            if (ttsReady) tts.stop();
        }

        /** Languages the phone can read aloud, as tags like "ru-RU". */
        @JavascriptInterface
        public String voices() {
            JSONArray out = new JSONArray();
            if (ttsReady) {
                for (String tag : TTS_LANGS) {
                    if (tts.isLanguageAvailable(Locale.forLanguageTag(tag)) >= TextToSpeech.LANG_AVAILABLE) out.put(tag);
                }
            }
            return out.toString();
        }

        @JavascriptInterface
        public void listen(String langTag) {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, langTag);
            runOnUiThread(() -> {
                try {
                    voicePicker.launch(i);
                } catch (ActivityNotFoundException e) {
                    callPage("window.NimiVoiceResult && NimiVoiceResult(null)");
                }
            });
        }

        @JavascriptInterface
        public void setTheme(String theme) {
            runOnUiThread(() -> applyTheme(theme));
        }
    }
}
