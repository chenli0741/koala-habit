# Koala Habit

Koala Habit is a family habit-building app for elementary school children. Kids complete learning, movement, and life tasks to unlock entertainment time and grow animal companions. Parents set goals, confirm outcomes, and help children build self-discipline.

## Workspace

- `web/` - Web app for child tasks and parent/admin workflows
- `server/` - API and domain logic
- `ios/` - Native iOS WebView shell that loads the web app

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

## Local Development

```bash
npm run restart
```

Or run each service separately:

```bash
npm run server
npm run web
```

Open the iOS shell in Xcode:

```bash
npm run ios:open
```

Build the iOS shell for the simulator:

```bash
npm run ios:build
```
