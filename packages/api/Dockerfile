FROM docker.io/denoland/deno:2.2.4

EXPOSE 8000

WORKDIR /app

# Copy the root deno.json first
COPY deno.json .

# Copy all workspace packages
COPY packages/core ./packages/core
COPY packages/api ./packages/api

WORKDIR /app/packages/api

RUN deno cache --reload --allow-scripts=npm:canvas@2.11.2 main.ts

CMD ["serve", "-A", "--allow-scripts=npm:canvas@2.11.2", "main.ts"]
