package com.kurdanime.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private static final String TAG = "KurdAnime";
    private WebView web;
    private FrameLayout root;
    private View nativeHome;
    private final Handler handler = new Handler();
    private boolean webReady = false;

    private TextView text(String value, float size, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setGravity(Gravity.CENTER);
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        v.setPadding(18, 8, 18, 8);
        return v;
    }

    private View nativeHome() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.rgb(5, 15, 25));
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        box.setPadding(28, 60, 28, 50);

        ImageView logo = new ImageView(this);
        logo.setImageResource(com.kurdanime.app.R.drawable.kurd_anime_icon);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        box.addView(logo, new LinearLayout.LayoutParams(-1, 210));
        box.addView(text("Kurd Anime", 30, Color.WHITE, true));
        box.addView(text("ئەنیمەکان لە یەک ئەپدا", 19, Color.LTGRAY, false));

        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1, 58);
        bp.topMargin = 30;
        Button open = new Button(this);
        open.setText("▶  دەستپێکردن");
        open.setTextSize(17);
        open.setTextColor(Color.WHITE);
        open.setAllCaps(false);
        open.setBackgroundColor(Color.rgb(230, 28, 65));
        box.addView(open, bp);
        open.setOnClickListener(v -> loadWeb());

        box.addView(text("Kurd Anime • v0.5.6", 12, Color.GRAY, false));
        scroll.addView(box);
        return scroll;
    }

    private void showNativeHome() {
        if (root == null) {
            root = new FrameLayout(this);
            nativeHome = nativeHome();
            root.addView(nativeHome, new FrameLayout.LayoutParams(-1, -1));
            web = createWebView();
            web.setVisibility(View.INVISIBLE);
            root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        }
        setContentView(root);
    }

    private void loadWeb() {
        showNativeHome();
        webReady = false;
        web.setVisibility(View.INVISIBLE);
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private WebView createWebView() {
        WebView w = new WebView(this);
        w.setBackgroundColor(Color.rgb(5, 15, 25));
        w.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                android.util.Log.d(TAG, message.message() + " @" + message.lineNumber());
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
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                handler.postDelayed(() -> view.evaluateJavascript("typeof window.KurdAnimeReady !== 'undefined' && window.KurdAnimeReady === true", value -> {
                    if ("true".equals(value)) {
                        webReady = true;
                        view.setVisibility(View.VISIBLE);
                    }
                }), 250);
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
        showNativeHome();
        loadWeb();
    }

    @Override public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (web != null) web.destroy();
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (webReady && web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
