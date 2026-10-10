FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm install

COPY src ./src

# Docker PostgreSQL şemasıyla derle
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma 2>/dev/null || true
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

# Container başlarken otomatik PostgreSQL şemasını senkronize eder, seed verilerini yükler ve sunucuyu başlatır
CMD ["sh", "-c", "cp prisma/schema.postgresql.prisma prisma/schema.prisma 2>/dev/null || true && npx prisma db push --accept-data-loss && npx prisma db seed && node dist/index.js"]
