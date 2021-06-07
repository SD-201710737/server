FROM node:alpine

WORKDIR /usr/app/server

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT [ "docker-express" ]

CMD ["$PORT"]