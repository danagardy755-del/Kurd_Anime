const ANILIST=process.env.ANILIST_URL||'https://graphql.anilist.co';
const JIKAN=process.env.JIKAN_URL||'https://api.jikan.moe/v4';
const query=`query($page:Int,$perPage:Int,$search:String,$sort:[MediaSort]){Page(page:$page,perPage:$perPage){media(type:ANIME,search:$search,sort:$sort,isAdult:false){id title{romaji english native} coverImage{large} bannerImage description episodes status seasonYear averageScore genres}}}`;
async function requestAniList(variables){const r=await fetch(ANILIST,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query,variables})});if(!r.ok)throw Error('AniList '+r.status);const j=await r.json();if(j.errors)throw Error(j.errors[0]?.message||'AniList error');return j.data.Page.media;}
function normalize(x){return{id:String(x.id),title:x.title?.english||x.title?.romaji||x.title?.native||'Unknown',titles:x.title||{},poster:x.coverImage?.large||null,banner:x.bannerImage||null,description:x.description||'',episodes:x.episodes??null,status:x.status||null,year:x.seasonYear||null,score:x.averageScore?x.averageScore/10:null,genres:x.genres||[]};}
async function fallback(q){const url=q?`${JIKAN}/anime?q=${encodeURIComponent(q)}&limit=25`:`${JIKAN}/top/anime?limit=25`;const r=await fetch(url);if(!r.ok)throw Error('Jikan '+r.status);return(await r.json()).data.map(normalize);}
export async function trending(){try{return(await requestAniList({page:1,perPage:20,sort:['TRENDING_DESC']})).map(normalize);}catch{return fallback('');}}
export async function search(q){try{return(await requestAniList({page:1,perPage:30,search:q||null,sort:['POPULARITY_DESC']})).map(normalize);}catch{return fallback(q);}}
export async function detail(id){
  try{
    const r=await fetch(ANILIST,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:`query($id:Int){Media(id:$id,type:ANIME){id title{romaji english native} coverImage{large} bannerImage description episodes status seasonYear averageScore genres}}`,variables:{id:Number(id)}})});
    if(r.ok){const j=await r.json();if(j.data?.Media)return normalize(j.data.Media);}
  }catch{}
  const jr=await fetch(`${JIKAN}/anime/${encodeURIComponent(id)}`);if(!jr.ok)throw Error('Not found');return normalize((await jr.json()).data);
}
export async function episodes(id){return{animeId:String(id),episodes:[],message:'Episode sources are supplied by an authorized streaming provider.'};}