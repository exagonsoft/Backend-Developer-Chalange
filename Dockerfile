FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:18

ENV NODE_ENV=production
ENV PORT=4000

RUN adduser --disabled-password appuser
USER appuser

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000

CMD ["node", "dist/server.js"]
