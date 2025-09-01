env := "dev"
is_ci := env_var_or_default('CI', env_var_or_default('BUILDER_OUTPUT', ''))


# Run a turbo script
turbo cmd:
    ENV={{ quote(env) }} npx turbo {{ cmd }}

[group('services')]
dev: (turbo "dev")

[group('services')]
dev-noapp: (turbo "dev --filter=@infinex/micropatrons-db")


# Seed asset config data to local DB
[group('chores')]
db-seed:
    pnpm --filter @infinex/micropatrons-db exec tsx scripts/seed.ts

[group('chores')]
db-reset:
    pnpm --filter @infinex/micropatrons-db exec tsx scripts/reset-db.ts --no-seed
