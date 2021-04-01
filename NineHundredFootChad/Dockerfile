FROM node:15.8.0
ENV NODE_ENV=development

RUN apt-get -y update
RUN apt-get -y install cmake

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "npx", "nodemon", "9fchad.js" ]