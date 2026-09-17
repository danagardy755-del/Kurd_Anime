# Kurd Anime streaming layer

The player now follows:

Episode → Source → Server → Stream

Supported stream types: HLS (.m3u8) and MP4. Quality selection uses the adaptive HLS maximum-resolution API (Auto/1080p/720p/480p/360p). Subtitle selection uses subtitle tracks exposed by the authorized media manifest.

Put real, authorized URLs in the episode Source/Server data. Empty URLs are intentionally not played.

The player uses expo-video's native VideoView/useVideoPlayer APIs.