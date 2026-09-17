import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { animeCatalog, getPlayableServers } from "@/lib/catalog";

export default function PlayerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string; episode?: string }>();
  const anime = useMemo(
    () => animeCatalog.find((item) => item.id === params.id) ?? animeCatalog[0],
    [params.id],
  );
  const episodeNumber = Number(params.episode ?? 1);
  const episode =
    anime.episodesList.find((item) => item.number === episodeNumber) ??
    anime.episodesList[0];

  const servers = useMemo(() => getPlayableServers(episode), [episode]);
  const [serverIndex, setServerIndex] = useState(0);
  const [quality, setQuality] = useState<"auto" | "1080p" | "720p" | "480p">("auto");
  const activeServer = servers[serverIndex];

  const source: VideoSource | null = activeServer
    ? {
        uri: activeServer.url,
        contentType: activeServer.type === "hls" ? "hls" : "progressive",
        headers: activeServer.headers,
      }
    : null;

  const player = useVideoPlayer(source, (instance) => {
    instance.play();
  });

  useEffect(() => {
    if (!source) return;
    player.replace(source);
    player.play();
  }, [activeServer?.id]);

  useEffect(() => {
    player.maxResolution = quality === "auto" ? null : Number.parseInt(quality, 10);
  }, [quality]);

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>گەڕانەوە</Text>
        </Pressable>

        <View style={[styles.videoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {source ? (
            <VideoView
              player={player}
              style={styles.video}
              nativeControls
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
              contentFit="contain"
            />
          ) : (
            <View style={styles.empty}>
              <IconSymbol name="play.circle.fill" size={58} color={colors.primary} />
              <Text style={[styles.videoTitle, { color: colors.foreground }]}>
                هیچ Stream ـێک دانەنراوە
              </Text>
              <Text style={[styles.videoHint, { color: colors.muted }]}>
                Source → Server → URL ـی m3u8 یان mp4 پێویستە.
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{anime.title}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          ئەڵقەی {episodeNumber} · {episode.title}
        </Text>

        {servers.length > 0 && (
          <>
            <Text style={[styles.section, { color: colors.foreground }]}>Server</Text>
            <View style={styles.row}>
              {servers.map((server, index) => (
                <Pressable
                  key={server.id}
                  onPress={() => setServerIndex(index)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: index === serverIndex ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: index === serverIndex ? "#fff" : colors.foreground, fontWeight: "800" }}>
                    {server.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {source && (
          <>
            <Text style={[styles.section, { color: colors.foreground }]}>Quality</Text>
            <View style={styles.row}>
              {(["auto", "1080p", "720p", "480p"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setQuality(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: quality === item ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: quality === item ? "#fff" : colors.foreground, fontWeight: "800" }}>
                    {item === "auto" ? "Auto" : item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, flex: 1 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  backText: { fontSize: 13, fontWeight: "700" },
  videoBox: { aspectRatio: 16 / 9, borderRadius: 18, borderWidth: 1, overflow: "hidden", justifyContent: "center", alignItems: "center" },
  video: { width: "100%", height: "100%" },
  empty: { justifyContent: "center", alignItems: "center", padding: 22 },
  videoTitle: { fontSize: 17, fontWeight: "900", marginTop: 12 },
  videoHint: { fontSize: 12, textAlign: "center", marginTop: 7, lineHeight: 19 },
  title: { fontSize: 21, fontWeight: "900", marginTop: 22 },
  meta: { fontSize: 12, marginTop: 5 },
  section: { fontSize: 14, fontWeight: "900", marginTop: 20, marginBottom: 9 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 11, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13 },
});
