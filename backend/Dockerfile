FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3601

ENV NODE_ENV=production
CMD ["node", "server.js"]
