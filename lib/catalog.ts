export type Episode = { number: number; title: string; duration: string; streamUrl?: string; subtitleUrl?: string };
export type Anime = { id: string; title: string; subtitle: string; genre: string; rating: string; episodes: number; cover: string; synopsis: string; episodesList: Episode[] };

const covers = [
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=780&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=780&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=780&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=780&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=780&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=780&q=80&sat=-30",
];
const episodes = (count: number): Episode[] => Array.from({ length: 6 }, (_, i) => ({ number: i + 1, title: `ئەڵقەی ${i + 1}`, duration: "24 خولەک" }));
export const animeCatalog: Anime[] = [
  { id: "jujutsu", title: "Jujutsu Kaisen", subtitle: "Season 2 · 2023", genre: "ئاکشن", rating: "9.0", episodes: 23, cover: covers[0], synopsis: "جیهانێکی تاریک لە جادوو و شەڕی نێوان جادووان و نفرەتەکان.", episodesList: episodes(23) },
  { id: "demon-slayer", title: "Demon Slayer", subtitle: "Hashira Training", genre: "ئاکشن", rating: "8.7", episodes: 11, cover: covers[1], synopsis: "تانجیرو لەگەڵ هاوڕێکانی بەردەوامی ڕێگای دژایەتی شەیتان دەکەن.", episodesList: episodes(11) },
  { id: "one-piece", title: "One Piece", subtitle: "Egghead Arc", genre: "فانتەزی", rating: "9.2", episodes: 1112, cover: covers[2], synopsis: "لوفی و تیمەکەی لە گەڕان بەدوای گەورەترین گەنجینەی جیهانن.", episodesList: episodes(1112) },
  { id: "spy-family", title: "SPY x FAMILY", subtitle: "Season 2", genre: "کۆمیدی", rating: "8.4", episodes: 12, cover: covers[3], synopsis: "خێزانێکی ساختە کە هەر یەکێکیان نهێنییەکی گەورەی هەیە.", episodesList: episodes(12) },
  { id: "attack", title: "Attack on Titan", subtitle: "The Final Season", genre: "دراما", rating: "9.1", episodes: 28, cover: covers[4], synopsis: "کۆتایییەکی کاریگەر بۆ چیرۆکی ئێرەن و هاوڕێکانی.", episodesList: episodes(28) },
  { id: "blue-lock", title: "Blue Lock", subtitle: "Season 1", genre: "ئاکشن", rating: "8.3", episodes: 24, cover: covers[5], synopsis: "پڕۆژەیەکی توند بۆ دروستکردنی باشترین گۆڵکار لە ژاپۆن.", episodesList: episodes(24) },
];
export const STREAM_API_URL = "https://api.jikan.moe/v4";
export const STREAM_SETUP_NOTE = "بۆ پەخشکردن، لە backend ـی خۆت URL ـی m3u8/mp4 ـی یاسایی زیاد بکە.";
