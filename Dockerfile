FROM node:4

RUN npm install sails -g
RUN npm install nodemon -g

# add only package.json so docker uses the cache to build image except when a dependency has changed
ADD package.json /src/package.json

RUN cd src && npm install

# add remaining source code to container so we can actually run the app
ADD . /src

WORKDIR /src

EXPOSE 1337

# package.json "start": "nodemon -L app.js", -L flag enable nodemon to poll all file 
CMD npm start
