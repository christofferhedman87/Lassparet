# Lärspåret teknisk PoC v6

## Förbättringsblock 5

Denna version har verklig pseudonym lagring genom Cloudflare Pages Functions och D1.
Frontend sparar alltid lokalt först och synkroniserar därefter till `/api/progress`.

## Viktig avgränsning

Detta är inte Södertälje kommuns beslutade målarkitektur. Ingen Entra-inloggning eller Dataverse-anslutning ingår. Servern lagrar ett slumpmässigt klient-ID och PoC-progression, inte namn eller e-postadress.

## Konfiguration

1. Installera beroenden med `npm install`.
2. Logga in i Wrangler med `npx wrangler login`.
3. Skapa D1-databasen med `npm run db:create`.
4. Kopiera returnerat `database_id` till `wrangler.jsonc`.
5. Kör migreringen med `npm run db:migrate:remote`.
6. Skapa eller anslut ett Cloudflare Pages-projekt.
7. Distribuera med `npm run deploy`.

Cloudflare-projektets D1-binding ska heta exakt `DB`.

## Lokal utveckling

Kör först lokal migrering och därefter utvecklingsservern:

```text
npm run db:migrate:local
npm run dev
```

## API

- `GET /api/progress`
- `PUT /api/progress`
- `DELETE /api/progress`

Alla anrop kräver rubriken `X-Larsparet-Client`.
