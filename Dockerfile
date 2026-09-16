FROM node:22-bookworm-slim

WORKDIR /app

COPY back/package*.json ./back/
RUN cd back && npm ci --omit=dev

COPY back ./back
COPY front ./front

RUN mkdir -p /data /uploads

ENV NODE_ENV=production
ENV PORT=8000
ENV DB_PATH=/data/recipes.db
ENV UPLOAD_DIR=/uploads

WORKDIR /app/back
EXPOSE 8000

CMD ["node", "server.js"]