import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const file=dirname(fileURLToPath(import.meta.url))+'/../data/db.json';
let db=null;
export async function loadDb(){if(db)return db;try{db=JSON.parse(await readFile(file,'utf8'));}catch{db={users:{},favorites:{},history:{}};await saveDb();}return db;}
export async function saveDb(){await writeFile(file,JSON.stringify(db,null,2));}
export async function ensureUser(id){await loadDb();if(!db.users[id]){db.users[id]={id,createdAt:new Date().toISOString()};await saveDb();}return db.users[id];}
export async function getLibrary(id){await ensureUser(id);return {favorites:db.favorites[id]||[],history:db.history[id]||[]};}
export async function addFavorite(id,item){await ensureUser(id);db.favorites[id]??=[];db.favorites[id]=[item,...db.favorites[id].filter(x=>String(x.id)!==String(item.id))];await saveDb();return db.favorites[id];}
export async function removeFavorite(id,animeId){await ensureUser(id);db.favorites[id]=(db.favorites[id]||[]).filter(x=>String(x.id)!==String(animeId));await saveDb();return db.favorites[id];}
export async function addHistory(id,item){await ensureUser(id);db.history[id]??=[];db.history[id]=[item,...db.history[id].filter(x=>!(String(x.animeId)===String(item.animeId)&&Number(x.episode)===Number(item.episode)))].slice(0,100);await saveDb();return db.history[id];}
