# Project verification

- Use Bun for package scripts; the repository tracks `bun.lock`.
- Type check: `bunx tsc --noEmit`.
- Lint: `bun run lint`.
- Unit tests: `bun run test:unit`. Vitest discovers `src/**/__tests__/**/*.test.ts` and excludes server integration tests.
- Production build: `bun run build`.
- Do not run `bun run test:integration` against an unverified database. The server tests delete rows in their setup; confirm an isolated disposable database and obtain approval first.
- `src/test/setup.ts` mocks React for server tests. React component unit tests must unmock React locally. Existing component tests use server rendering and mock upload/network hooks; they do not require live storage.
