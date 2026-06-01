# Koala Habit

Koala Habit is a family habit-building app for elementary school children. Kids complete learning, movement, and life tasks to unlock entertainment time and grow animal companions. Parents set goals, confirm outcomes, and help children build self-discipline.

## Workspace

- `app/` - Expo iPad-first mobile/tablet app
- `web/` - Parent/admin web console
- `server/` - API and domain logic

## First Milestone

1. Child sees today's missions.
2. Child completes learning, movement, and life tasks.
3. Parent confirms outcomes.
4. Child earns reward time and companion growth.

## Preview Deploy

The preview API is declared in `render.yaml` as a Render web service plus a preview Postgres database. Create the Render blueprint from this repository, then the API will be available at:

```text
https://koala-habit-api-preview.onrender.com
```

The mobile preview build reads that URL from `app/eas.json` through `EXPO_PUBLIC_API_URL`.

```bash
npm run build:preview:ios
npm run build:preview:android
```

For an iOS Simulator preview build:

```bash
npm run build:preview:simulator
```
