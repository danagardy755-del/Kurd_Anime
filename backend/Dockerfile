FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY sql ./sql
RUN mkdir -p data
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 8787
CMD ["node","src/server.js"]
