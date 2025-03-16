FROM docker.io/denoland/deno:2.2.4

EXPOSE 8000

WORKDIR /app

# Copy the root deno.json first
COPY deno.json .

# Copy all workspace packages
COPY packages/core ./packages/core
COPY packages/api ./packages/api

WORKDIR /app/packages/api

# Cache all dependencies and allow the canvas package to run its install scripts
RUN deno cache --reload --allow-scripts=npm:canvas@2.11.2 main.ts

RUN timeout 10s deno -A --allow-scripts=npm:canvas@2.11.2 main.ts || [ $? -eq 124 ] || exit 1

# Use 'serve' instead of 'run' for HTTP servers
CMD ["serve", "-A", "--allow-scripts=npm:canvas@2.11.2", "main.ts"]
