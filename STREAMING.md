# Kurd Anime streaming architecture

Kurd Anime now uses three anime-focused source slots:

1. **Kurd Anime Licensed CDN** — the primary HLS source for video that Kurd Anime owns or has distribution rights for.
2. **Crunchyroll Partner** — anime-focused provider integration, enabled only after an approved partner/licensing arrangement supplies an authorized playback or deep-link target.
3. **HIDIVE Partner** — anime-focused provider integration, enabled only after an authorized commercial/technical arrangement and applicable regional rights are confirmed.

The backend deliberately does not scrape protected streaming services, bypass DRM, or proxy unauthorized streams. Provider adapters are designed so credentials and partner endpoints stay in server-side environment variables rather than the Android APK.

## Why this design

The three providers are all anime-focused, while keeping the app independent from the old AnimeTV infrastructure. Metadata services such as AniList/Jikan are separate from video sources.

## What is still required for live playback

- A real CDN/media storage location containing content Kurd Anime is licensed to distribute.
- Partner credentials/endpoints for any external commercial provider that grants Kurd Anime integration access.
- Region-specific rights and terms for the territories where the app will operate.

Never put partner secrets in the Android app. Store them only as server environment variables.
