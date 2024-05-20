FROM node:18
LABEL authors="ZH"

WORKDIR /app

COPY ./package.json ./

RUN yarn

COPY . .

RUN ln -s /app/node_modules /node_modules

RUN yarn build

CMD ["yarn", "start"]
