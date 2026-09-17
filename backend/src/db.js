import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const {Pool} = pg;
const file=dirname(fileURLToPath(import.meta.url))+'/../data/db.json';
const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='false'?false:{rejectUnauthorized:false}}):null;
const serverlessNoDb=!pool&&process.env.VERCEL==='1';
let db=serverlessNoDb?{users:{},favorites:{},history:{}}:null;
let initialized=false;

export async function loadDb(){
  if(pool){
    if(!initialized){
      await pool.query(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE TABLE IF NOT EXISTS favorites (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, anime_id TEXT NOT NULL, title TEXT, poster TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(user_id,anime_id)); CREATE TABLE IF NOT EXISTS watch_history (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, anime_id TEXT NOT NULL, episode INTEGER, position_seconds INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX IF NOT EXISTS idx_history_user ON watch_history(user_id,updated_at DESC);`);
      initialized=true;
    }
    return null;
  }
  if(db)return db;
  try{db=JSON.parse(await readFile(file,'utf8'));}catch{db={users:{},favorites:{},history:{}};await saveDb();}
  return db;
}
export async function saveDb(){if(!pool&&!serverlessNoDb)await writeFile(file,JSON.stringify(db,null,2));}
export async function ensureUser(id){
  await loadDb();
  if(pool){await pool.query('INSERT INTO users(id) VALUES($1) ON CONFLICT(id) DO NOTHING',[id]);return{id};}
  if(!db.users[id]){db.users[id]={id,createdAt:new Date().toISOString()};await saveDb();}return db.users[id];
}
export async function getLibrary(id){
  await ensureUser(id);
  if(pool){const f=await pool.query('SELECT anime_id AS id,title,poster,created_at FROM favorites WHERE user_id=$1 ORDER BY created_at DESC',[id]);const h=await pool.query('SELECT anime_id AS "animeId",episode,position_seconds AS "positionSeconds",updated_at AS "updatedAt" FROM watch_history WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100',[id]);return{favorites:f.rows,history:h.rows};}
  return{favorites:db.favorites[id]||[],history:db.history[id]||[]};
}
export async function addFavorite(id,item){
  await ensureUser(id);
  if(pool){await pool.query('INSERT INTO favorites(user_id,anime_id,title,poster) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,anime_id) DO UPDATE SET title=EXCLUDED.title,poster=EXCLUDED.poster',[id,String(item.id),item.title||null,item.poster||null]);return(await getLibrary(id)).favorites;}
  db.favorites[id]??=[];db.favorites[id]=[item,...db.favorites[id].filter(x=>String(x.id)!==String(item.id))];await saveDb();return db.favorites[id];
}
export async function removeFavorite(id,animeId){
  await ensureUser(id);
  if(pool){await pool.query('DELETE FROM favorites WHERE user_id=$1 AND anime_id=$2',[id,String(animeId)]);return(await getLibrary(id)).favorites;}
  db.favorites[id]=(db.favorites[id]||[]).filter(x=>String(x.id)!==String(animeId));await saveDb();return db.favorites[id];
}
export async function addHistory(id,item){
  await ensureUser(id);
  if(pool){await pool.query('INSERT INTO watch_history(user_id,anime_id,episode,position_seconds) VALUES($1,$2,$3,$4)',[id,String(item.animeId),Number(item.episode)||null,Number(item.positionSeconds)||0]);return(await getLibrary(id)).history;}
  db.history[id]??=[];db.history[id]=[item,...db.history[id].filter(x=>!(String(x.animeId)===String(item.animeId)&&Number(x.episode)===Number(item.episode)))].slice(0,100);await saveDb();return db.history[id];
}