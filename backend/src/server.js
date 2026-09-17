import http from 'node:http';
import {URL} from 'node:url';
import {loadDb,getLibrary,addFavorite,removeFavorite,addHistory} from './db.js';
import * as providers from './providers.js';

const PORT=Number(process.env.PORT||8787);
const HOST=process.env.HOST||'127.0.0.1';
const origin=process.env.CORS_ORIGIN||'*';
const VERSION='0.4.0';
function send(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,DELETE,OPTIONS','access-control-allow-headers':'content-type,x-device-id'});res.end(JSON.stringify(data));}
async function body(req){let s='';for await(const c of req)s+=c;return s?JSON.parse(s):{};}
const parts=p=>p.split('/').filter(Boolean);
function deviceId(req,requested){return String(req.headers['x-device-id']||requested||'').trim().slice(0,128);}
http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,DELETE,OPTIONS','access-control-allow-headers':'content-type,x-device-id'});return res.end();}
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  try{
    await loadDb();
    if(u.pathname==='/health')return send(res,200,{ok:true,service:'kurd-anime-api',version:VERSION,time:new Date().toISOString(),database:Boolean(process.env.DATABASE_URL)});
    if(u.pathname==='/api/config')return send(res,200,{appName:'Kurd Anime',version:VERSION,languages:['ku','en','ar'],defaultLanguage:'ku',features:{metadata:true,library:true,history:true,streamingProviders:true}});
    const p=parts(u.pathname);
    if(p[0]!=='api')return send(res,404,{error:'Not found'});
    if(p[1]==='anime'&&p[2]==='trending'&&req.method==='GET')return send(res,200,{data:await providers.trending()});
    if(p[1]==='anime'&&p[2]==='search'&&req.method==='GET')return send(res,200,{data:await providers.search(u.searchParams.get('q')||'')});
    if(p[1]==='anime'&&p[2]&&p[3]==='episodes'&&req.method==='GET')return send(res,200,{data:await providers.episodes(p[2])});
    if(p[1]==='anime'&&p[2]&&req.method==='GET')return send(res,200,{data:await providers.detail(p[2])});
    if(p[1]==='library'){
      const requested=p[2]==='device'?'':p[2];
      const user=deviceId(req,requested);
      if(!user)return send(res,400,{error:'X-Device-ID is required'});
      if(req.method==='GET'&&(p.length===2||p[2]==='device'))return send(res,200,{data:await getLibrary(user)});
      if(req.method==='POST'&&p[3]==='favorites')return send(res,200,{data:await addFavorite(user,await body(req))});
      if(req.method==='DELETE'&&p[3]==='favorites'&&p[4])return send(res,200,{data:await removeFavorite(user,p[4])});
      if(req.method==='POST'&&p[3]==='history')return send(res,200,{data:await addHistory(user,await body(req))});
    }
    return send(res,404,{error:'Route not found'});
  }catch(e){console.error(e);return send(res,502,{error:e.message||'Upstream error'});}
}).listen(PORT,HOST,()=>console.log(`Kurd Anime API listening on http://${HOST}:${PORT}`));
