FROM node:20-alpine

# Install canvas dependencies
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4003

CMD ["node", "src/server.js"]
