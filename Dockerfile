FROM mhart/alpine-node:4.2

ADD . /app

WORKDIR /app

RUN npm install

CMD ["npm", "start"]
