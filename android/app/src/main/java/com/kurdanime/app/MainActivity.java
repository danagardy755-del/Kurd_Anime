package com.kurdanime.app;
import android.app.*; import android.os.*; import android.webkit.*; import android.content.*;
public class MainActivity extends Activity{
 static final String API="http://10.0.2.2:8787/api";
 @Override public void onCreate(Bundle b){super.onCreate(b); WebView w=new WebView(this); w.getSettings().setJavaScriptEnabled(true);w.getSettings().setDomStorageEnabled(true);w.getSettings().setMediaPlaybackRequiresUserGesture(false);w.setWebViewClient(new WebViewClient());w.loadUrl("file:///android_asset/index.html?api="+Uri.encode(API));setContentView(w);}
}
