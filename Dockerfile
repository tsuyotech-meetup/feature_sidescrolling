FROM node:22-bookworm-slim AS base

WORKDIR /app

COPY app/package*.json app/package-lock.json ./

RUN npm install

COPY app/ .


# Development stage
FROM base AS dev

RUN apt-get update && apt-get install -y \
    git

# Production stage
FROM base AS prod

CMD [ "node" , "main.js" ]