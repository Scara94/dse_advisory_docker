FROM node:23.3-alpine

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install --legacy-peer-deps

COPY ./frontend .

RUN npm run build

EXPOSE 80

CMD [ "npm", "start" ]