FROM node:lts-alpine
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*"]
RUN npm install
COPY . .

RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
