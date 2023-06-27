FROM --platform=linux/amd64 node:18

WORKDIR /app

COPY . .

RUN npm install

CMD npx ts-node-esm app.ts
