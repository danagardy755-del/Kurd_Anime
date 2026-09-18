import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
export default function FavoritesScreen() { const colors = useColors(); return <ScreenContainer className="p-5"><View style={styles.center}><Text style={[styles.icon, { color: colors.primary }]}>♡</Text><Text style={[styles.title, { color: colors.foreground }]}>دڵخوازەکانت</Text><Text style={[styles.text, { color: colors.muted }]}>هەر ئەنیمەیەک دڵت خواست، لە لاپەڕەی details دڵی بکە بۆ ئەوەی لێرە بیبینیت.</Text></View></ScreenContainer>; }
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28 }, icon: { fontSize: 72, fontWeight: "200" }, title: { fontSize: 24, fontWeight: "900", marginTop: 12 }, text: { textAlign: "center", fontSize: 13, lineHeight: 21, marginTop: 10 } });
