const qs = new URLSearchParams(location.search);
let API = qs.get('api') || localStorage.getItem('apiBase') || '';
let lang = localStorage.lang || 'ku';
let page = 'home';

const T = {
  ku:{home:'ماڵەوە',anime:'ئەنیمەکان',movies:'فیلم و زنجیرە',library:'کتێبخانە',more:'زیاتر',trending:'بەناوبانگ',latest:'نوێترین',search:'گەڕان',settings:'ڕێکخستنەکان',watch:'بینین',all:'هەموو',language:'زمان',query:'ناوی ئەنیمە بگەڕێ...',server:'بەستەری سێرڤەر',save:'پاشەکەوتکردن',saved:'پاشەکەوتکرا',loading:'چاوەڕوان بە...',offline:'پەیوەندی بە سێرڤەرەکە نییە.',noResults:'هیچ ئەنجامێک نەدۆزرایەوە',serverMissing:'سێرڤەری Kurd Anime هێشتا دانەنراوە.'},
  en:{home:'Home',anime:'Anime',movies:'Movies & TV',library:'Library',more:'More',trending:'Trending',latest:'Latest',search:'Search',settings:'Settings',watch:'Watch',all:'All',language:'Language',query:'Search anime...',server:'Server URL',save:'Save',saved:'Saved',loading:'Loading...',offline:'The Kurd Anime server is not reachable.',noResults:'No results found',serverMissing:'The Kurd Anime server has not been configured yet.'},
  ar:{home:'الرئيسية',anime:'الأنمي',movies:'الأفلام والمسلسلات',library:'المكتبة',more:'المزيد',trending:'الأكثر رواجاً',latest:'الأحدث',search:'بحث',settings:'الإعدادات',watch:'مشاهدة',all:'الكل',language:'اللغة',query:'ابحث عن أنمي...',server:'رابط الخادم',save:'حفظ',saved:'تم الحفظ',loading:'جار التحميل...',offline:'لا يمكن الوصول إلى خادم Kurd Anime.',noResults:'لم يتم العثور على نتائج',serverMissing:'لم يتم إعداد خادم Kurd Anime بعد.'}
};
const t = k => T[lang][k] || k;

async function api(path,opt={}) {
  if(!API) throw new Error('API_NOT_CONFIGURED');
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),8000);
  try {
    const r = await fetch(API.replace(/\/$/,'') + path,{...opt,signal:controller.signal,headers:{'accept':'application/json',...(opt.headers||{})}});
    if(!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function clean(s){return String(s??'').replace(/<[^>]*>/g,'').trim();}
function top(){return `<header class="top"><b class="brand">KURD<span class="accent">ANIME</span></b></header>`;}
function nav(){return `<nav class="bottom">${[['home','⌂'],['anime','◉'],['movies','▣'],['library','▤'],['more','☷']].map(x=>`<button class="nav ${page===x[0]?'active':''}" onclick="go('${x[0]}')">${x[1]}<br>${t(x[0])}</button>`).join('')}</nav>`;}
function state(msg){return `<div class="offline">ℹ️ ${esc(msg)}</div>`;}
function card(x){const poster=x.poster?`<img class="poster-img" src="${esc(x.poster)}" loading="lazy" alt="">`:`<div class="poster">${esc(x.title)}</div>`;return `<div class="tile" onclick="detail('${esc(x.id)}')">${poster}<small>${esc(x.title)}</small><br><small>⭐ ${x.score??'-'}</small></div>`;}
function list(items){if(!items?.length)return `<p>${t('noResults')}</p>`;return `<div class="list">${items.map(x=>`<div class="item" onclick="detail('${esc(x.id)}')"><div class="thumb">${x.poster?`<img src="${esc(x.poster)}" loading="lazy" alt="">`:''}</div><div><h3>${esc(x.title)}</h3><p>${x.year||''}${x.score!=null?' • ⭐ '+x.score:''}</p></div></div>`).join('')}</div>`;}

async function home(){
  if(!API) return `${top()}<section class="hero"><h1>Kurd Anime</h1><p>${t('serverMissing')}</p></section>${serverForm()}${nav()}`;
  try {const j=await api('/anime/trending');const items=j?.data||[];return `${top()}<section class="hero"><h1>Kurd Anime</h1><p>${lang==='ku'?'ئەنیمەی ڕاستەقینە و داتای ڕاستەوخۆ':'Live anime metadata from the Kurd Anime API'}</p></section><section class="section"><h2>${t('trending')}</h2>${list(items)}</section>${nav()}`;}catch(e){return `${top()}${state(t('offline'))}<section class="section"><h2>${t('trending')}</h2><p>${t('loading')}</p></section>${nav()}`;}
}
async function anime(){
  let items=[];try{items=(await api('/anime/trending'))?.data||[];}catch(e){}
  return `${top()}<section class="section"><h2>${t('anime')}</h2><input class="search" placeholder="${t('query')}" onkeydown="if(event.key==='Enter')search(this.value)">${!API?state(t('serverMissing')):items.length?list(items):state(t('offline'))}</section>${nav()}`;
}
async function search(q){q=String(q||'').trim();let items=[];let err=false;try{items=(await api('/anime/search?q='+encodeURIComponent(q)))?.data||[];}catch(e){err=true;}document.getElementById('app').innerHTML=`${top()}<section class="section"><input class="search" autofocus value="${esc(q)}" placeholder="${t('query')}" onkeydown="if(event.key==='Enter')search(this.value)">${err?state(t('offline')):list(items)}</section>${nav()}`;}
async function detail(id){try{const x=(await api('/anime/'+encodeURIComponent(id)))?.data;if(!x)throw Error('not found');document.getElementById('app').innerHTML=`${top()}<section class="hero">${x.banner?`<img class="banner" src="${esc(x.banner)}" alt="">`:''}<h1>${esc(x.title)}</h1><p>${x.year||''}${x.score!=null?' • ⭐ '+x.score:''}</p><button class="cta" onclick="episodes('${esc(x.id)}')">${t('watch')}</button></section><section class="section"><p>${esc(clean(x.description).slice(0,1600))}</p>${x.genres?.length?`<p>${x.genres.map(esc).join(' • ')}</p>`:''}</section>${nav()}`;}catch(e){document.getElementById('app').innerHTML=`${top()}${state(t('offline'))}${nav()}`;}}
async function episodes(id){try{const j=await api('/anime/'+encodeURIComponent(id)+'/episodes');const eps=j?.data?.episodes||[];document.getElementById('app').innerHTML=`${top()}<section class="section"><h2>${t('watch')}</h2>${eps.length?eps.map(e=>`<button class="item" onclick="play('${esc(e.url)}')">Episode ${esc(e.number)}</button>`).join(''):state('No authorized streaming episodes are configured.')}</section>${nav()}`;}catch(e){document.getElementById('app').innerHTML=`${top()}${state(t('offline'))}${nav()}`;}}
function play(url){if(url)location.href=url;}
async function library(){if(!API)return `${top()}${state(t('serverMissing'))}${nav()}`;try{const j=await api('/library/device');return `${top()}<section class="section"><h2>${t('library')}</h2>${list(j?.data?.favorites||[])}</section>${nav()}`}catch(e){return `${top()}${state(t('offline'))}${nav()}`;}}
function serverForm(){return `<section class="section"><h2>${t('settings')}</h2><label>${t('server')}</label><input id="server" class="search" value="${esc(API)}" placeholder="https://your-kurd-anime-server.example/api"><button class="cta" onclick="saveServer()">${t('save')}</button></section>`;}
async function more(){return `${top()}${serverForm()}<section class="section"><h2>${t('language')}</h2><button onclick="setLang('ku')">کوردی سۆرانی</button> <button onclick="setLang('en')">English</button> <button onclick="setLang('ar')">العربية</button></section>${nav()}`;}
async function movies(){return `${top()}<section class="section"><h2>${t('movies')}</h2><p>${t('serverMissing')}</p></section>${nav()}`;}
function saveServer(){const v=document.getElementById('server')?.value.trim().replace(/\/$/,'');if(v){API=v;localStorage.setItem('apiBase',v);render();}}
async function go(p){page=p;render();}
function setLang(x){lang=x;localStorage.lang=x;render();}
async function render(){document.documentElement.dir=lang==='en'?'ltr':'rtl';document.documentElement.lang=lang;const root=document.getElementById('app');root.innerHTML=`${top()}<section class="section"><h2>${t('loading')}</h2></section>`;try{root.innerHTML=await ({home,anime,movies,library,more}[page]||home)();}catch(e){root.innerHTML=`${top()}${state(e.message)}${nav()}`;}}
render();
