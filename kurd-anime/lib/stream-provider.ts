import type { Episode, StreamServer, Subtitle } from "./catalog";

type ProviderResult = {
  servers: StreamServer[];
  subtitles: Subtitle[];
};

const VIDLINK_API_BASE = "https://vidlink.pro/api/b";
const VIDLINK_ENCODE_URL = "https://enc-dec.app/api/enc-vidlink?text=";

type VidLinkResponse = {
  stream?: {
    playlist?: string;
    qualities?: Record<string, {
      url?: string;
      type?: string;
      codecName?: string;
      codec?: string;
    }>;
    captions?: Array<{
      url?: string;
      file?: string;
      language?: string;
      lang?: string;
      label?: string;
    }>;
  };
  captions?: Array<{
    url?: string;
    file?: string;
    language?: string;
    lang?: string;
    label?: string;
  }>;
};

function streamType(url: string, type?: string): "hls" | "mp4" {
  const value = String(type ?? "").toLowerCase();
  if (value.includes("mpegurl") || value.includes("hls") || url.includes(".m3u8")) {
    return "hls";
  }
  return "mp4";
}

function isUnsupportedCodec(item: { url?: string; codecName?: string; codec?: string }) {
  const codec = String(item.codecName ?? item.codec ?? "").toLowerCase();
  const url = String(item.url ?? "").toLowerCase();
  return codec.includes("hevc") || codec.includes("h265") || codec.includes("h.265") || url.includes("/h265/");
}

function captionsToSubtitles(captions: VidLinkResponse["stream"]["captions"]): Subtitle[] {
  return (captions ?? [])
    .map((caption, index) => {
      const url = caption.url ?? caption.file;
      if (!url) return null;
      const label = caption.label ?? caption.language ?? caption.lang ?? "English";
      return {
        id: `vidlink-sub-${index}`,
        language: caption.language ?? caption.lang ?? label,
        label,
        url,
      };
    })
    .filter((item): item is Subtitle => item !== null);
}

/**
 * Resolves a real stream from the same VidLink integration exposed by the
 * supplied AnimeTV APK. Use this only where the provider has authorized you
 * to consume its API.
 */
export async function resolveVidLink(params: {
  tmdbId: string | number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}): Promise<ProviderResult> {
  const encodedResponse = await fetch(
    VIDLINK_ENCODE_URL + encodeURIComponent(String(params.tmdbId)),
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    },
  );

  if (!encodedResponse.ok) {
    throw new Error(`VidLink encode failed: ${encodedResponse.status}`);
  }

  const encodedData = (await encodedResponse.json()) as { result?: string };
  if (!encodedData.result) throw new Error("VidLink encode returned no result");

  const path =
    params.mediaType === "tv"
      ? `/tv/${encodeURIComponent(encodedData.result)}/${encodeURIComponent(String(params.season ?? 1))}/${encodeURIComponent(String(params.episode ?? 1))}`
      : `/movie/${encodeURIComponent(encodedData.result)}`;

  const response = await fetch(VIDLINK_API_BASE + path + "?multiLang=0", {
    headers: {
      "X-Ref-Prox": "https://vidlink.pro/",
      "X-Org-Prox": "https://vidlink.pro",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  if (!response.ok) {
    throw new Error(`VidLink stream request failed: ${response.status}`);
  }

  const data = (await response.json()) as VidLinkResponse;
  const qualities = data.stream?.qualities;
  const servers: StreamServer[] = [];

  if (qualities) {
    for (const [quality, item] of Object.entries(qualities)) {
      if (!item?.url || isUnsupportedCodec(item)) continue;
      servers.push({
        id: `vidlink-${quality}`,
        name: quality === "auto" ? "Auto" : `${quality}p`,
        type: streamType(item.url, item.type),
        url: item.url,
        headers: {
          Referer: "https://vidlink.pro/",
        },
      });
    }
  }

  if (servers.length === 0 && data.stream?.playlist) {
    servers.push({
      id: "vidlink-auto",
      name: "Auto",
      type: streamType(data.stream.playlist),
      url: data.stream.playlist,
      headers: {
        Referer: "https://vidlink.pro/",
      },
    });
  }

  return {
    servers,
    subtitles: captionsToSubtitles(data.stream?.captions ?? data.captions),
  };
}

export function attachResolvedStream(
  episode: Episode,
  result: ProviderResult,
): Episode {
  return {
    ...episode,
    sources: result.servers.length
      ? [
          {
            id: "vidlink",
            name: "VidLink",
            kind: "softsub",
            servers: result.servers,
            subtitles: result.subtitles,
          },
        ]
      : [],
  };
}
