# base image used
FROM node:alpine

# directory used later in container
WORKDIR /app
# copy package.json
COPY package*.json ./
# install dependencies required for node js
RUN npm install 

# copy the whole files
COPY . .

# listen to spesific port
EXPOSE 8080

# run this command when the app started
CMD [ "npm", "start" ]



# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install 
# COPY . ./
# RUN npm run start

# FROM node:18-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./
# ENTRYPOINT ["node", "bundle.js"]