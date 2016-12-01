FROM mhart/alpine-node:6

ADD . /app
WORKDIR /app

RUN npm i --production && npm i -g typescript typings \
  && typings i \
  && tsc \
  && npm remove -g typescript typings \
  && rm -rf typings

CMD ["npm", "start"]
