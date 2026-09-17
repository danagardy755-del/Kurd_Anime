# Kurd Anime — Streaming / Player Setup

## Architecture

`Anime → Episode → Source → Server → Stream URL`

Supported stream types:
- HLS: `.m3u8`
- MP4: direct progressive video

The player uses `expo-video` with native controls, fullscreen, picture-in-picture, server switching and maximum-resolution control.

## Real stream data

Stream URLs must be supplied by the owner/licensor or returned by an authorized API. The catalog intentionally contains empty server URLs until real authorized data is connected.

Example:

```ts
{
  id: "server-1",
  name: "Main",
  type: "hls",
  url: "https://example.com/video/episode-1.m3u8"
}
```

## Subtitles

The catalog supports subtitle metadata. `expo-video` can expose subtitle tracks included by the media source/manifest. An external `.vtt` URL should not be assumed to work as an external track unless it is integrated into the authorized media source/manifest.

## Quality

For HLS, adaptive bitrate should be provided by the HLS manifest. The player can apply a maximum resolution such as Auto, 1080p, 720p or 480p.

## Authorized API

If the provider supplies an API, configure:

```
EXPO_PUBLIC_STREAM_API_URL=https://your-authorized-api.example
```

Then map the provider response into the existing `Anime / Episode / Source / Server` types in `lib/catalog.ts`.

## Release checklist

Before production APK/AAB:

1. Connect the real authorized stream API or real stream URLs.
2. Test at least one real HLS episode on Android.
3. Test server switching.
4. Test quality limiting/adaptive playback.
5. Test subtitle tracks supplied by the media source.
6. Test fullscreen and picture-in-picture.
7. Handle expired/broken stream URLs with a user-friendly error.
8. Verify Android permissions/configuration and dependencies.
9. Run a production Android build.
10. Install and test the resulting APK/AAB on a real device.

The streaming/player architecture is prepared, but a production build cannot be declared fully ready until real authorized stream data is connected and tested.
