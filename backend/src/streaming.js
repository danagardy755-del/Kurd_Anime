const providers = [
  {
    id: 'kurd-cdn',
    name: process.env.KURD_CDN_NAME || 'Kurd Anime CDN',
    type: 'hls',
    enabled: Boolean(process.env.KURD_CDN_BASE_URL),
    baseUrl: process.env.KURD_CDN_BASE_URL || null,
    template: process.env.KURD_CDN_TEMPLATE || '{animeId}/{episode}.m3u8',
    priority: 1,
    note: 'Your own licensed media/CDN. Recommended as the primary source.'
  },
  {
    id: 'youtube-official',
    name: 'YouTube Official',
    type: 'youtube',
    enabled: Boolean(process.env.YOUTUBE_SOURCE_ENABLED === 'true'),
    baseUrl: 'https://www.youtube.com/embed/',
    priority: 2,
    note: 'Only videos/channels that permit embedding and are authorized for your catalog.'
  },
  {
    id: 'crunchyroll-partner',
    name: 'Crunchyroll Partner',
    type: 'partner',
    enabled: Boolean(process.env.CRUNCHYROLL_PARTNER_ENABLED === 'true'),
    baseUrl: process.env.CRUNCHYROLL_PARTNER_BASE_URL || null,
    priority: 3,
    note: 'Requires an approved partner/licensing arrangement; never scrape or proxy protected streams.'
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
      results.push({sourceId:p.id,name:p.name,type:'hls',url:`${p.baseUrl.replace(/\/$/,'')}/${path.replace(/^\//,'')}`});
    }
  }
  return results.sort((a,b) => (providers.find(x=>x.id===a.sourceId)?.priority||99) - (providers.find(x=>x.id===b.sourceId)?.priority||99));
}
