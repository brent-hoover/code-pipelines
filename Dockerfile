FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci
COPY . .

RUN npm run build
EXPOSE 3000
ENV NODE_ENV production

# Run the application
CMD ["node", "dist/app.js"]
