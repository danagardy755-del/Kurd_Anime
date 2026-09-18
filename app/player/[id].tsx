import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { animeCatalog, STREAM_SETUP_NOTE } from "@/lib/catalog";

export default function PlayerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string; episode?: string }>();
  const anime = useMemo(() => animeCatalog.find((item) => item.id === params.id) ?? animeCatalog[0], [params.id]);
  const episode = Number(params.episode ?? 1);
  const current = anime.episodesList.find((item) => item.number === episode) ?? anime.episodesList[0];
  const openStream = () => { if (current.streamUrl) void Linking.openURL(current.streamUrl); };
  return <ScreenContainer edges={["top", "left", "right", "bottom"]}><View style={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><IconSymbol name="chevron.left" size={22} color={colors.foreground} /><Text style={[styles.backText, { color: colors.foreground }]}>گەڕانەوە</Text></Pressable>
    <View style={[styles.videoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><IconSymbol name="play.circle.fill" size={58} color={colors.primary} /><Text style={[styles.videoTitle, { color: colors.foreground }]}>پلەیر ئامادەیە</Text><Text style={[styles.videoHint, { color: colors.muted }]}>URL ـی stream ـی یاسایی زیاد بکە بۆ دەستپێکردنی پەخش</Text>{current.streamUrl ? <Pressable style={[styles.streamButton, { backgroundColor: colors.primary }]} onPress={openStream}><Text style={styles.streamButtonText}>دەستپێکردنی stream</Text></Pressable> : <View style={[styles.note, { backgroundColor: colors.background }]}><IconSymbol name="info.circle" size={16} color={colors.primary} /><Text style={[styles.noteText, { color: colors.muted }]}>{STREAM_SETUP_NOTE}</Text></View>}</View>
    <Text style={[styles.title, { color: colors.foreground }]}>{anime.title}</Text><Text style={[styles.meta, { color: colors.muted }]}>ئەڵقەی {episode} · {current.title}</Text>
    <View style={styles.controls}><Pressable style={[styles.control, { backgroundColor: colors.surface }]}><IconSymbol name="text.bubble" size={18} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>زیرنووس</Text></Pressable><Pressable style={[styles.control, { backgroundColor: colors.surface }]}><IconSymbol name="speedometer" size={18} color={colors.primary} /><Text style={[styles.controlText, { color: colors.foreground }]}>1x</Text></Pressable></View>
  </View></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 18, flex: 1 }, back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 }, backText: { fontSize: 13, fontWeight: "700" }, videoBox: { aspectRatio: 16 / 9, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center", padding: 22 }, videoTitle: { fontSize: 17, fontWeight: "900", marginTop: 12 }, videoHint: { fontSize: 12, textAlign: "center", marginTop: 7, lineHeight: 19 }, note: { borderRadius: 12, padding: 10, flexDirection: "row", gap: 7, alignItems: "center", marginTop: 13 }, noteText: { fontSize: 11, flex: 1, lineHeight: 17 }, streamButton: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, marginTop: 13 }, streamButtonText: { color: "#fff", fontSize: 12, fontWeight: "800" }, title: { fontSize: 21, fontWeight: "900", marginTop: 22 }, meta: { fontSize: 12, marginTop: 5 }, controls: { flexDirection: "row", gap: 10, marginTop: 22 }, control: { flexDirection: "row", gap: 7, alignItems: "center", borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14 }, controlText: { fontSize: 12, fontWeight: "700" } });
