# 使用 Node.js 基础镜像
FROM node:16

WORKDIR /app

COPY ./package.json ./

RUN yarn

COPY . .

RUN ln -s /app/node_modules /node_modules

RUN yarn build

CMD ["yarn", "start"]
