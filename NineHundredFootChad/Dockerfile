FROM node:15.8.0
ENV NODE_ENV=development

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install bindings --save
RUN npm install node-libsamplerate --save
RUN npm install

COPY . .

CMD [ "npx", "nodemon", "9fchad.js" ]