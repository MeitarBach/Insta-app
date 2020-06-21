FROM node:latest

WORKDIR /app
COPY . /app

RUN npm install

EXPOSE 3000

CMD ["node", "/app/index.js"]