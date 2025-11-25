FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# Runner stage
FROM base AS runner
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Environment setup
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

# We don't run the server here by default in this strategy, 
# because we want to allow the command to be overridden by docker-compose
# to perform "build && start".
# However, providing a default CMD is good practice.
CMD ["bun", "start"]