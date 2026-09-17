const API = new URLSearchParams(location.search).get('api') || '';
let lang = localStorage.lang || 'ku';
let page = 'home';

const T = {
  ku:{home:'ماڵەوە',anime:'ئەنیمەکان',movies:'فیلم و زنجیرە',library:'کتێبخانە',more:'زیاتر',trending:'بەناوبانگ',latest:'نوێترین',search:'گەڕان',settings:'ڕێکخستنەکان',watch:'ئێستا ببینە',all:'هەموو',language:'زمان',query:'ناوی ئەنیمە بگەڕێ...',offline:'داتا بە شێوەی demo ـە؛ API پەیوەندی نییە.',noResults:'هیچ ئەنجامێک نەدۆزرایەوە'},
  en:{home:'Home',anime:'Anime',movies:'Movies & TV',library:'Library',more:'More',trending:'Trending',latest:'Latest',search:'Search',settings:'Settings',watch:'Watch Now',all:'All',language:'Language',query:'Search anime...',offline:'Demo data is shown because the API is not connected.',noResults:'No results found'},
  ar:{home:'الرئيسية',anime:'الأنمي',movies:'الأفلام والمسلسلات',library:'المكتبة',more:'المزيد',trending:'الأكثر رواجاً',latest:'الأحدث',search:'بحث',settings:'الإعدادات',watch:'شاهد الآن',all:'الكل',language:'اللغة',query:'ابحث عن أنمي...',offline:'يتم عرض بيانات تجريبية لأن الـ API غير متصل.',noResults:'لم يتم العثور على نتائج'}
};
const t = k => T[lang][k] || k;

const demo = [
  {id:'demo-1',title:'Naruto',year:2002,score:8.3},
  {id:'demo-2',title:'One Piece',year:1999,score:8.7},
  {id:'demo-3',title:'Attack on Titan',year:2013,score:9.0},
  {id:'demo-4',title:'Demon Slayer',year:2019,score:8.6},
  {id:'demo-5',title:'Jujutsu Kaisen',year:2020,score:8.5},
  {id:'demo-6',title:'Solo Leveling',year:2024,score:8.8}
];

async function api(path,opt={}) {
  if(!API) throw new Error('API_NOT_CONFIGURED');
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),5000);
  try {
    const r = await fetch(API + path,{...opt,signal:controller.signal});
    if(!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

function top(){return `<header class="top"><b class="brand">KURD<span class="accent">ANIME</span></b></header>`;}
function nav(){return `<nav class="bottom">${[['home','⌂'],['anime','◉'],['movies','▣'],['library','▤'],['more','☷']].map(x=>`<button class="nav ${page===x[0]?'active':''}" onclick="go('${x[0]}')">${x[1]}<br>${t(x[0])}</button>`).join('')}</nav>`;}
function card(x){return `<div class="tile" onclick="detail('${x.id}')"><div class="poster">${escapeHtml(x.title)}</div><small>${escapeHtml(x.title)}</small><br><small>⭐ ${x.score??'-'}</small></div>`;}
function escapeHtml(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function offline(){return `<div class="offline">ℹ️ ${t('offline')}</div>`;}
function renderList(items){
  if(!items?.length) return `<p>${t('noResults')}</p>`;
  return `<div class="list">${items.map(x=>`<div class="item" onclick="detail('${x.id}')"><div class="thumb"></div><div><h3>${escapeHtml(x.title)}</h3><p>${x.year||''} • ⭐ ${x.score??'-'}</p></div></div>`).join('')}</div>`;
}

async function home(){
  let items=demo, isOffline=true;
  try { const j=await api('/anime/trending'); if(j?.data?.length){items=j.data;isOffline=false;} } catch(e) {}
  return `${top()}<section class="hero"><h1>Kurd Anime</h1><p>${lang==='ku'?'هەموو ئەنیمەکان لێرە':'Anime, movies and series in one place'}</p><button class="cta" onclick="go('anime')">${t('watch')}</button></section>${isOffline?offline():''}<section class="section"><h2>${t('trending')}</h2><div class="row">${items.slice(0,10).map(card).join('')}</div></section>${nav()}`;
}

async function anime(){
  let items=demo,isOffline=true;
  try { const j=await api('/anime/trending'); if(j?.data?.length){items=j.data;isOffline=false;} } catch(e) {}
  return `${top()}<section class="section"><h2>${t('anime')}</h2><input class="search" placeholder="${t('query')}" onkeydown="if(event.key==='Enter')search(this.value)">${isOffline?offline():''}${renderList(items)}</section>${nav()}`;
}

async function search(q){
  let items=[];
  try { const j=await api('/anime/search?q='+encodeURIComponent(q)); items=j?.data||[]; }
  catch(e) { items=demo.filter(x=>x.title.toLowerCase().includes(String(q).toLowerCase())); }
  document.getElementById('app').innerHTML=`${top()}<section class="section"><input class="search" autofocus value="${escapeHtml(q)}" onkeydown="if(event.key==='Enter')search(this.value)">${!API?offline():''}${renderList(items)}</section>${nav()}`;
}

async function detail(id){
  let x=demo.find(v=>v.id===id)||{id,title:'Kurd Anime',year:'',score:'-'};
  try { const j=await api('/anime/'+encodeURIComponent(id)); if(j?.data)x=j.data; } catch(e) {}
  document.getElementById('app').innerHTML=`${top()}<section class="hero"><h1>${escapeHtml(x.title)}</h1><p>${x.year||''} • ⭐ ${x.score??'-'}</p><button class="cta" onclick="episodes('${x.id}')">${t('watch')}</button></section><section class="section"><p>${escapeHtml((x.description||'').replace(/<[^>]*>/g,'').slice(0,900))}</p>${!API?offline():''}</section>${nav()}`;
}

async function episodes(id){
  try { const j=await api('/anime/'+encodeURIComponent(id)+'/episodes'); alert(j?.data?.message||'Episodes API ready.'); }
  catch(e) { alert(lang==='ku'?'سەرچاوەی بینین لە وەشانی داهاتوودا زیاد دەکرێت.':lang==='ar'?'مصدر المشاهدة سيضاف في الإصدار القادم.':'Streaming source will be added in the next release.'); }
}

async function library(){return `${top()}<section class="section"><h2>${t('library')}</h2><p>${lang==='ku'?'دڵخوازەکان و مێژووی بینین لێرە کۆدەکرێتەوە.':'Your favorites and watch history will appear here.'}</p></section>${nav()}`;}
async function more(){return `${top()}<section class="section"><h2>${t('settings')}</h2><div class="item"><div><h3>${t('language')}</h3><button onclick="setLang('ku')">کوردی سۆرانی</button> <button onclick="setLang('en')">English</button> <button onclick="setLang('ar')">العربية</button></div></div></section>${nav()}`;}
async function movies(){return `${top()}<section class="section"><h2>${t('movies')}</h2><p>Movie/TV metadata adapter is ready for the next provider module.</p></section>${nav()}`;}
async function go(p){page=p;render();}
function setLang(x){lang=x;localStorage.lang=x;render();}
async function render(){
  document.documentElement.dir=lang==='en'?'ltr':'rtl';
  document.documentElement.lang=lang;
  try { document.getElementById('app').innerHTML=await ({home,anime,movies,library,more}[page]||home)(); }
  catch(e) { document.getElementById('app').innerHTML=`${top()}<section class="section"><h2>Kurd Anime</h2><p>${escapeHtml(e.message)}</p></section>${nav()}`; }
}
render();
