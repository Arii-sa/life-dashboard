FROM node:20-alpine

WORKDIR /app

# package.json が存在する場合のみ install（初回はスキップ）
COPY package*.json ./
RUN npm install --legacy-peer-deps 2>/dev/null || true

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
