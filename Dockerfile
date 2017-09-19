FROM node:8.2-alpine

ENV HOME=/app
COPY package.json package-lock.json $HOME/

WORKDIR $HOME
RUN npm install
COPY . $HOME/
