FROM mhart/alpine-node:8

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app/scheduler
RUN npm install


WORKDIR /usr/src/app/seneca-job-queue
RUN npm install


EXPOSE 3000 5000 9000

CMD node runAll.js
