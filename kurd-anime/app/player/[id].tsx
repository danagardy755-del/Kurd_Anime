import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import { useEvent } from "expo";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { animeCatalog, Quality, Source, StreamServer, getPlayableServers } from "@/lib/catalog";

const qualityHeight: Record<Exclude<Quality, "auto">, number> = {
  "1080p": 1080, "720p": 720, "480p": 480, "360p": 360,
};

function sourceToVideoSource(server: StreamServer, title: string): VideoSource {
  return {
    uri: server.url,
    contentType: server.type === "hls" ? "hls" : "progressive",
    headers: server.headers,
    metadata: { title, artist: "Kurd Anime" },
  };
}

export default function PlayerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string; episode?: string }>();
  const anime = useMemo(() => animeCatalog.find((item) => item.id === params.id) ?? animeCatalog[0], [params.id]);
  const episodeNumber = Number(params.episode ?? 1);
  const current = anime.episodesList.find((item) => item.number === episodeNumber) ?? anime.episodesList[0];

  const [selectedSourceId, setSelectedSourceId] = useState(current.sources[0]?.id ?? "");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [quality, setQuality] = useState<Quality>("auto");
  const [showSources, setShowSources] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const videoRef = useRef<VideoView>(null);

  const selectedSource: Source = current.sources.find((item) => item.id === selectedSourceId) ?? current.sources[0];
  const playableServers = getPlayableServers(current);
  const sourceServers = selectedSource?.servers.filter((server) => Boolean(server.url)) ?? [];
  const activeServer = sourceServers.find((server) => server.id === selectedServerId) ?? sourceServers[0] ?? playableServers[0];
  const videoSource = activeServer ? sourceToVideoSource(activeServer, `${anime.title} · ئەڵقەی ${episodeNumber}`) : null;

  const player = useVideoPlayer(videoSource, (instance) => {
    instance.timeUpdateEventInterval = 0.5;
    instance.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const { status } = useEvent(player, "statusChange", { status: player.status });
  const { currentTime } = useEvent(player, "timeUpdate", { currentTime: player.currentTime });

  useEffect(() => {
    setSelectedSourceId(current.sources[0]?.id ?? "");
    setSelectedServerId("");
    setQuality("auto");
  }, [anime.id, current.number]);

  useEffect(() => {
    if (!selectedServerId && sourceServers[0]) setSelectedServerId(sourceServers[0].id);
  }, [selectedServerId, sourceServers]);

  useEffect(() => {
    if (!activeServer) return;
    const next = sourceToVideoSource(activeServer, `${anime.title} · ئەڵقەی ${episodeNumber}`);
    void player.replaceAsync(next).then(() => player.play()).catch(() => undefined);
  }, [activeServer?.id]);

  useEffect(() => {
    if (quality === "auto") { player.maxResolution = null; return; }
    const height = qualityHeight[quality];
    player.maxResolution = { width: height * 16 / 9, height };
  }, [quality]);

  const hasStream = Boolean(activeServer?.url);
  const subtitleTracks = player.availableSubtitleTracks;

  const selectSource = (source: Source) => {
    setSelectedSourceId(source.id);
    const first = source.servers.find((server) => Boolean(server.url));
    setSelectedServerId(first?.id ?? "");
    setShowSources(false);
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>گەڕانەوە</Text>
        </Pressable>
        <View style={[styles.videoBox, { backgroundColor: "#000", borderColor: colors.border }]}>
          {hasStream ? (
            <VideoView ref={videoRef} player={player} style={styles.video} nativeControls contentFit="contain" allowsPictureInPicture fullscreenOptions={{ enable: true, orientation: "landscape" }} />
          ) : (
            <View style={styles.emptyPlayer}>
              <IconSymbol name="play.circle.fill" size={58} color={colors.primary} />
              <Text style={styles.emptyTitle}>Stream ئامادە نییە</Text>
              <Text style={styles.emptyHint}>Source → Server ـەکە URL ـی stream ـی یاسایی پێویستە.</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{anime.title}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>ئەڵقەی {episodeNumber} · {current.title}</Text>
        {hasStream && <Text style={[styles.status, { color: status === "error" ? "#EF4444" : colors.muted }]}>{status === "loading" ? "خەریکی بارکردنە…" : status === "error" ? "کێشەی پەخشکردن" : isPlaying ? "پەخشکردن" : "وەستاندراو"} · {Math.floor(currentTime)}s</Text>}

        <View style={styles.controls}>
          <Pressable style={[styles.control, { backgroundColor: colors.surface }]} onPress={() => setShowSources((v) => !v)}>
            <IconSymbol name="play.circle" size={18} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>Source</Text>
          </Pressable>
          <Pressable style={[styles.control, { backgroundColor: colors.surface }]} onPress={() => setShowQuality((v) => !v)}>
            <IconSymbol name="speedometer" size={18} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>{quality}</Text>
          </Pressable>
          <Pressable style={[styles.control, { backgroundColor: colors.surface }]} onPress={() => setShowSubtitles((v) => !v)}>
            <IconSymbol name="text.bubble" size={18} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>زیرنووس</Text>
          </Pressable>
        </View>

        {showSources && <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>Source / Server</Text>
          {current.sources.map((source) => <View key={source.id} style={styles.sourceGroup}>
            <Pressable onPress={() => selectSource(source)} style={styles.optionRow}>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{source.name} · {source.kind.toUpperCase()}</Text>
              {source.id === selectedSource?.id && <Text style={[styles.selected, { color: colors.primary }]}>✓</Text>}
            </Pressable>
            {source.id === selectedSource?.id && source.servers.map((server) => <Pressable key={server.id} disabled={!server.url} onPress={() => { setSelectedServerId(server.id); setShowSources(false); }} style={[styles.serverRow, !server.url && { opacity: 0.45 }]}>
              <Text style={[styles.serverText, { color: colors.foreground }]}>{server.name} · {server.type.toUpperCase()}</Text>
              {server.id === activeServer?.id && <Text style={[styles.selected, { color: colors.primary }]}>✓</Text>}
            </Pressable>)}
          </View>)}
        </View>}

        {showQuality && <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>Quality</Text>
          {(["auto", "1080p", "720p", "480p", "360p"] as Quality[]).map((item) => <Pressable key={item} onPress={() => { setQuality(item); setShowQuality(false); }} style={styles.optionRow}>
            <Text style={[styles.optionText, { color: colors.foreground }]}>{item === "auto" ? "Auto" : item}</Text>
            {quality === item && <Text style={[styles.selected, { color: colors.primary }]}>✓</Text>}
          </Pressable>)}
        </View>}

        {showSubtitles && <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>Subtitle</Text>
          {subtitleTracks.length ? subtitleTracks.map((track) => <Pressable key={track.id ?? `${track.language}-${track.label}`} onPress={() => { player.subtitleTrack = track; setShowSubtitles(false); }} style={styles.optionRow}>
            <Text style={[styles.optionText, { color: colors.foreground }]}>{track.label || track.language}</Text>
            {player.subtitleTrack?.id === track.id && <Text style={[styles.selected, { color: colors.primary }]}>✓</Text>}
          </Pressable>) : <Text style={[styles.noTracks, { color: colors.muted }]}>هیچ subtitle track ـێک لەلایەن stream ـەکەوە نەنێردراوە.</Text>}
          <Pressable onPress={() => { player.subtitleTrack = null; setShowSubtitles(false); }} style={styles.optionRow}><Text style={[styles.optionText, { color: colors.foreground }]}>بێ زیرنووس</Text></Pressable>
        </View>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 36 }, back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 }, backText: { fontSize: 13, fontWeight: "700" },
  videoBox: { width: "100%", aspectRatio: 16 / 9, borderRadius: 18, borderWidth: 1, overflow: "hidden" }, video: { flex: 1 }, emptyPlayer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { color: "#fff", fontSize: 17, fontWeight: "900", marginTop: 12 }, emptyHint: { color: "#A7A7B4", fontSize: 12, textAlign: "center", marginTop: 7, lineHeight: 19 },
  title: { fontSize: 21, fontWeight: "900", marginTop: 22 }, meta: { fontSize: 12, marginTop: 5 }, status: { fontSize: 11, marginTop: 8 }, controls: { flexDirection: "row", gap: 8, marginTop: 18, flexWrap: "wrap" },
  control: { flexDirection: "row", gap: 7, alignItems: "center", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14 }, controlText: { fontSize: 12, fontWeight: "700" }, panel: { marginTop: 12, borderRadius: 15, borderWidth: 1, padding: 10 },
  panelTitle: { fontSize: 14, fontWeight: "900", marginBottom: 4 }, sourceGroup: { marginTop: 3 }, optionRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  serverRow: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 24, paddingRight: 8 }, optionText: { fontSize: 12, fontWeight: "700" }, serverText: { fontSize: 11 }, selected: { fontSize: 15, fontWeight: "900" }, noTracks: { fontSize: 11, lineHeight: 18, padding: 8 },
});
