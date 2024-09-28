FROM node:lts-alpine
RUN apk update --no-cache && \
    apk upgrade --no-cache && \
    apk add --no-cache \
      bash ca-certificates \
      python3 py3-pip \
      make g++ pixman-dev cairo-dev pango-dev

WORKDIR /src
COPY /src/package.json /src/package.json
RUN npm install

COPY /src /src

CMD node main.js