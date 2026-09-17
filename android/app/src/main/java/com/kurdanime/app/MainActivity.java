package com.kurdanime.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private WebView web;
    private LinearLayout nativeHome;

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

    private void showHome() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.rgb(5, 15, 25));

        nativeHome = new LinearLayout(this);
        nativeHome.setOrientation(LinearLayout.VERTICAL);
        nativeHome.setGravity(Gravity.CENTER_HORIZONTAL);
        nativeHome.setPadding(28, 55, 28, 80);

        ImageView icon = new ImageView(this);
        icon.setImageResource(R.drawable.ic_kurd_anime);
        LinearLayout.LayoutParams ip = new LinearLayout.LayoutParams(190, 190);
        ip.bottomMargin = 18;
        nativeHome.addView(icon, ip);

        nativeHome.addView(text("KURD ANIME", 34, Color.WHITE, true));
        nativeHome.addView(text("ئەنیمەی کوردی لە یەک ئەپدا", 21, Color.rgb(255, 45, 80), true));
        nativeHome.addView(text("بگەڕێ، ئەنیمەکان بدۆزەوە و بە زمانی دڵخوازت بەکاری بهێنە.", 16, Color.LTGRAY, false));

        LinearLayout.LayoutParams gap = new LinearLayout.LayoutParams(-1, 56);
        gap.topMargin = 28;
        gap.bottomMargin = 14;
        Button start = button("▶  دەستپێکردن");
        nativeHome.addView(start, gap);

        TextView status = text("سێرڤەر: Kurd Anime API  ✓", 14, Color.rgb(120, 210, 150), false);
        nativeHome.addView(status);

        LinearLayout cards = new LinearLayout(this);
        cards.setOrientation(LinearLayout.VERTICAL);
        cards.setPadding(0, 35, 0, 0);
        cards.addView(text("⭐ ئەنیمەی بەناوبانگ", 22, Color.WHITE, true));
        cards.addView(text("One Piece     •     Naruto     •     Demon Slayer     •     Jujutsu Kaisen", 15, Color.LTGRAY, false));
        nativeHome.addView(cards);

        TextView languages = text("کوردی  •  English  •  العربية", 14, Color.rgb(170, 180, 195), false);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.topMargin = 30;
        nativeHome.addView(languages, lp);

        start.setOnClickListener(v -> openWeb());
        scroll.addView(nativeHome);
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
        w.setWebChromeClient(new WebChromeClient());
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        w.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                return response;
            }
        });
        w.getSettings().setJavaScriptEnabled(true);
        w.getSettings().setDomStorageEnabled(true);
        w.getSettings().setDatabaseEnabled(true);
        w.getSettings().setMediaPlaybackRequiresUserGesture(false);
        w.getSettings().setAllowFileAccess(false);
        w.getSettings().setAllowContentAccess(false);
        return w;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        showHome();
    }

    @Override public void onBackPressed() {
        if (web != null && web.getParent() != null) {
            showHome();
        } else {
            super.onBackPressed();
        }
    }
}
