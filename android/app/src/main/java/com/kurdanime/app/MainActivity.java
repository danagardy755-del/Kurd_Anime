package com.kurdanime.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private static final String TAG = "KurdAnime";
    private WebView web;

    private TextView text(String value, float size, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setGravity(Gravity.CENTER);
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        v.setPadding(20, 10, 20, 10);
        return v;
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(16);
        b.setTextColor(Color.WHITE);
        b.setAllCaps(false);
        b.setBackgroundColor(Color.rgb(230, 28, 65));
        return b;
    }

    private void showFallback(String reason) {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.rgb(5, 15, 25));
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        box.setPadding(28, 80, 28, 80);

        box.addView(text("KURD", 48, Color.WHITE, true));
        box.addView(text("ANIME", 48, Color.rgb(255, 33, 72), true));
        box.addView(text("ئەپەکە ئامادەیە", 22, Color.WHITE, true));
        box.addView(text("کێشەیەک لە بارکردنی بەشی ناوخۆ هەبوو. ئەمە fallback ـە بۆ ئەوەی شاشە بەتاڵ نەبێت.", 16, Color.LTGRAY, false));

        Button retry = button("↻  دووبارە هەوڵدانەوە");
        LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(-1, 58);
        rp.topMargin = 25;
        box.addView(retry, rp);
        retry.setOnClickListener(v -> openWeb());

        TextView debug = text(reason == null ? "" : reason, 11, Color.GRAY, false);
        debug.setVisibility(View.GONE);
        box.addView(debug);
        scroll.addView(box);
        setContentView(scroll);
    }

    private void openWeb() {
        if (web == null) web = createWebView();
        setContentView(web);
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private WebView createWebView() {
        WebView w = new WebView(this);
        w.setBackgroundColor(Color.rgb(5, 15, 25));
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                Log.d(TAG, message.message() + " @" + message.lineNumber());
                return true;
            }
        });
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        w.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                return response;
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showFallback(error == null ? "WebView error" : String.valueOf(error.getDescription()));
                }
            }
        });
        w.getSettings().setJavaScriptEnabled(true);
        w.getSettings().setDomStorageEnabled(true);
        w.getSettings().setDatabaseEnabled(true);
        w.getSettings().setMediaPlaybackRequiresUserGesture(false);
        w.getSettings().setAllowFileAccess(false);
        w.getSettings().setAllowContentAccess(false);
        w.getSettings().setLoadsImagesAutomatically(true);
        w.getSettings().setBlockNetworkImage(false);
        return w;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        openWeb();
    }

    @Override public void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (web != null && web.getParent() != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
