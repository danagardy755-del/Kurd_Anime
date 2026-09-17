package com.kurdanime.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private WebView web;

    private TextView text(String value, float size, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setTextColor(color);
        v.setGravity(Gravity.CENTER);
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        v.setPadding(24, 12, 24, 12);
        return v;
    }

    private void showNativeFallback() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(32, 40, 32, 40);
        root.setBackgroundColor(Color.rgb(6, 17, 27));

        ImageView icon = new ImageView(this);
        icon.setImageResource(com.kurdanime.app.R.drawable.ic_kurd_anime);
        root.addView(icon, new LinearLayout.LayoutParams(130, 130));

        root.addView(text("KURD ANIME", 30, Color.WHITE, true));
        root.addView(text("بەخێربێیت بۆ Kurd Anime", 20, Color.rgb(255, 33, 72), true));
        root.addView(text("ئەپەکە بار نەکرا. تکایە دووبارە هەوڵ بدەرەوە.", 15, Color.LTGRAY, false));

        Button retry = new Button(this);
        retry.setText("دووبارە هەوڵدانەوە");
        retry.setTextColor(Color.WHITE);
        retry.setBackgroundColor(Color.rgb(255, 33, 72));
        retry.setOnClickListener(v -> {
            setContentView(web);
            web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
        });
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-2, -2);
        bp.topMargin = 22;
        root.addView(retry, bp);
        setContentView(root);
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(6, 17, 27));
        web.setWebChromeClient(new WebChromeClient());

        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showNativeFallback();
            }
        });

        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setDatabaseEnabled(true);
        web.getSettings().setMediaPlaybackRequiresUserGesture(false);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setBuiltInZoomControls(false);
        web.getSettings().setDisplayZoomControls(false);
        setContentView(web);
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
