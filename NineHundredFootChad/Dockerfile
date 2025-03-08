FROM node:15.8.0

ARG NODE_ENV=default
ENV NODE_ENV=$NODE_ENV

RUN apt-get -y update
RUN apt-get -y install cmake

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "npx", "nodemon", "9fchad.js" ]