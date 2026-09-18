const providers = [
  {
    id: 'kurd-anime-cdn',
    name: process.env.KURD_ANIME_CDN_NAME || 'Kurd Anime Licensed CDN',
    type: 'hls',
    enabled: Boolean(process.env.KURD_ANIME_CDN_BASE_URL),
    baseUrl: process.env.KURD_ANIME_CDN_BASE_URL || null,
    template: process.env.KURD_ANIME_CDN_TEMPLATE || '{animeId}/{episode}.m3u8',
    priority: 1,
    note: 'Primary source for media you own or are licensed to distribute.'
  },
  {
    id: 'crunchyroll-partner',
    name: 'Crunchyroll Partner',
    type: 'partner',
    enabled: Boolean(process.env.CRUNCHYROLL_PARTNER_ENABLED === 'true'),
    baseUrl: process.env.CRUNCHYROLL_PARTNER_BASE_URL || 'https://www.crunchyroll.com/',
    priority: 2,
    note: 'Anime-focused provider. Requires an approved partner/licensing integration; the API must return an authorized playback/deep-link target.'
  },
  {
    id: 'hidive-partner',
    name: 'HIDIVE Partner',
    type: 'partner',
    enabled: Boolean(process.env.HIDIVE_PARTNER_ENABLED === 'true'),
    baseUrl: process.env.HIDIVE_PARTNER_BASE_URL || 'https://www.hidive.com/',
    priority: 3,
    note: 'Anime-focused provider. Requires an authorized commercial/technical integration and region-appropriate rights.'
  }
];

export function sourceConfig() {
  return providers.map(({id,name,type,enabled,priority,note}) => ({id,name,type,enabled,priority,note}));
}

function encodePart(value) {
  return encodeURIComponent(String(value ?? '').trim());
}

export function resolveEpisode(animeId, episode) {
  const enabled = providers.filter(p => p.enabled);
  const results = [];
  for (const p of enabled) {
    if (p.type === 'hls' && p.baseUrl) {
      const path = p.template.replaceAll('{animeId}', encodePart(animeId)).replaceAll('{episode}', encodePart(episode));
      results.push({
        sourceId:p.id,
        name:p.name,
        type:'hls',
        url:`${p.baseUrl.replace(/\/$/,'')}/${path.replace(/^\//,'')}`
      });
    }
  }
  return results.sort((a,b) => (providers.find(x=>x.id===a.sourceId)?.priority||99) - (providers.find(x=>x.id===b.sourceId)?.priority||99));
}
