FROM node:14.12.0

RUN mkdir -p /usr/src/aoonjai-api
WORKDIR /usr/src/aoonjai-api

COPY package.json /usr/src/aoonjai-api

COPY package-lock.json /usr/src/aoonjai-api
RUN pwd
RUN npm install
RUN npm install nodemon -g


COPY . /usr/src/aoonjai-api



EXPOSE 8000