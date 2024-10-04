FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN rm -rf src tests *.log

FROM node:18-slim

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000

RUN adduser --disabled-password appuser
USER appuser

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]