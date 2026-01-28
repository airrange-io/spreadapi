# SpreadAPI Runtime - Dockerfile

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ \
    pkgconfig cairo-dev pango-dev jpeg-dev giflib-dev pixman-dev
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SPREADJS_LICENSE_KEY=*.airrange.io,578671945396143#B1UWh9mNwYlUyAlS0VFTYV4dW9mNtFle4kkd8syUaF4UHdDSyJHbMljQjhneXdWO6RkR7dlcRllVycWRllkRPNzRMFWWHZmargnNFpUcXp6VPpUYSVkQtlUM9BDaxkTRnJXNjhTWuFnU5Q7VzI6UDpVUGdje4UjNUpXWK34bnRmYBF5QWN6M05USFtScVBTWNRTOaFlZ7pnej3STZ5GU486KwcVM4MlQR9UUOt6a5NXV58kUv5EdHljM5JjRVV4apB7RPZkMMp6KxFFRapWe5N7MBVzRSdXb9wUbQhWapJDcoFnbrQnSWlTdIJnaWdEOuBFRQJmI0IyUiwiI8AjNBFkQGRjI0ICSiwiM8UjM6ADN4YTM0IicfJye#4Xfd5nIIlkSCJiOiMkIsICOx8idgMlSgQWYlJHcTJiOi8kI1tlOiQmcQJCLiITNwADOwASOxITM4IDMyIiOiQncDJCLi2WauU6ZuFmcylWYuoiI0IyctRkIsICSi56RgUmchdHdm36UgU6ZuFmcylWQiojIh94QiwiIzQTM6kzM5QTOxcjN8cTNiojIklkIs4XXbpjInxmZiwSZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TQNd6T7AXb63STptkQtNVY7wEOklkcqNjTtREN4MENvolN4RDOpJzUHt6SCBjY6QTUNFzUrhVTqJGS8UFROp4N9pWOqVUbYVjNrdTYkxWaMlUe9FTW69WV92mdh5WYBR1RMU

RUN apk add --no-cache cairo pango jpeg giflib pixman

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/services /app/logs && chown -R nextjs:nodejs /app/services /app/logs

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
