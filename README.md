# Kurd Anime v0.3 — Real System Foundation

This release turns the prototype into a functional mobile + backend system.

## Architecture
Android/WebView UI -> Kurd Anime API -> metadata providers -> persistence
                                      -> authorized streaming-provider interface

## Included
- 3 languages: Kurdish Sorani RTL, English LTR, Arabic RTL
- Real backend API using Node.js built-in HTTP server (no npm dependency required)
- AniList GraphQL integration for catalog/search/details
- Jikan REST fallback
- Local JSON persistence for development
- PostgreSQL schema for production migration
- Favorites/history endpoints
- Provider interface for only authorized/legitimate streaming sources
- Health/config endpoints
- Android app wired to a configurable backend URL

## Run backend
Requires Node.js 20+.

    cd backend
    node src/server.js

Default: http://127.0.0.1:8787

For a phone on the same Wi-Fi, set HOST=0.0.0.0 and configure the Android API URL to your computer's LAN IP.

Environment:
- PORT=8787
- HOST=0.0.0.0
- CORS_ORIGIN=*
- ANILIST_URL=https://graphql.anilist.co
- JIKAN_URL=https://api.jikan.moe/v4
- KURDANIME_API_URL=http://10.0.2.2:8787/api

## API
GET  /health
GET  /api/config
GET  /api/anime/trending
GET  /api/anime/search?q=naruto
GET  /api/anime/:id
GET  /api/anime/:id/episodes
GET  /api/library/:userId
POST /api/library/:userId/favorites
DELETE /api/library/:userId/favorites/:animeId
POST /api/library/:userId/history

The app uses anonymous local user id until authentication is added.

## Important
The supplied decompiled AnimeTV project contained hard-coded third-party credentials and many third-party streaming/source domains. They are NOT copied into this release. Metadata is accessed through documented public APIs, and streaming is intentionally abstracted behind an authorization boundary. Add a provider only when you have permission/rights to use it.
