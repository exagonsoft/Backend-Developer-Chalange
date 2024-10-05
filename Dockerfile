FROM node:18

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY . .

RUN npm install

RUN npx prisma generate

RUN adduser --disabled-password appuser
USER appuser

EXPOSE 4000

CMD ["npm", "start"]
