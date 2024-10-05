FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=4000
ENV PRISMA_CLIENT_ENGINE_TYPE=binary

RUN npx prisma generate

RUN npm run build

RUN adduser --disabled-password appuser

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 4000

CMD ["node", "dist/server.js"]
