FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . ./
RUN npm run start

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./
ENTRYPOINT ["node", "bundle.js"]