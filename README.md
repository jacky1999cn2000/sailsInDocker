# sailsInDocker

这个dockerized app是用来利用amouat/dnmonster的服务(不同的字符串对应不同的图片)，用sails request这个服务，然后将获得的图片返回
code中需要注意的是：

1. 如何将request后得到的response里面的binary data弄出来
2. 如果将binary data保存到redis里面去

Javascript controller

```javascript
/**
 * SystemsController
 *
 * @description :: Server-side logic for managing systems
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 'use strict';

var co = require('co');
var request = require("co-request");

//https://www.npmjs.com/package/promise-redis
var redis = require('promise-redis')();
var redis_client = redis.createClient({
  //host:'192.168.99.100',
  host:'redis_server',
  port:'6379',
  //store binary data in redis
  // http://stackoverflow.com/questions/20732332/how-to-store-a-binary-object-in-redis-using
  return_buffers: true
});

module.exports = {

    available: function (req, res) {
      return res.send("OK");
    },

    monster: function (req, res){
      co(function* () {

        let value = yield redis_client.get(req.param('name'));


        if(value == null){
          console.log('value is null');
          // http://stackoverflow.com/questions/14855015/getting-binary-content-in-node-js-using-request
          let requestSettings = {
               method: 'GET',
               //url: 'http://192.168.99.100:32768//monster/'+req.param('name')+'?size=80',
               url: 'http://dnmonster:8080//monster/'+req.param('name')+'?size=80',
               encoding: null
          };
          let response = yield request(requestSettings);
          yield redis_client.set(req.param('name'),response.body);
          return response.body;
        }else{
          console.log('value: ',value);
          return value;
        }
      })
      .then(function(body){
        res.type('png');
        res.send(body);
      })
      .catch(function(err) {
        console.log('*** catch ***');
        console.log(err);
      });

      // 如果不需要存储到redis的话，可以简单地直接pipe到response (这里使用原装的request)
      // return request('http://dnmonster:8080/monster/'+req.param('name')+'?size=80').pipe(res);

    }
};
```

Dockerfile
```javascript
FROM node:4 //基于node:4 image

RUN npm install sails -g //安装sails
RUN npm install nodemon -g //安装nodemon - nodemon在volumes mount后无法auto-refresh(http://www.ybrikman.com/writing/2015/05/19/docker-osx-dev/)

ADD package.json /src/package.json //# add only package.json so docker uses the cache to build image except when a dependency has changed

RUN cd src && npm install

ADD . /src //# add remaining source code to container so we can actually run the app

WORKDIR /src

EXPOSE 1337

CMD npm start
```

利用docker engine(只建议利用docker engine来build image,运行的话还是用docker-compose):
```javascript
[docker pull amouat/dnmonster](https://hub.docker.com/r/amouat/dnmonster/)
docker pull redis
docker run -d --name dnmonster amouat/dnmonster:latest
docker run -d --name redis_server redis
docker build -t sailsindocker .
docker run -it -p 1337:1337 -v $(pwd):/src --link dnmonster:dnmonster --link redis:redis_server --rm sailsindocker
```

利用docker-compose: 

```javascript
sailsindocker:
      # build: . (# 不建议用container做开发)
      image: sailsindocker
      ports:
       - "1337:1337"
      # volumes:
      #  - .:/src
      links:
       - dnmonster
       - redis_server
dnmonster:
  image: amouat/dnmonster:latest
redis_server:
  image: redis
```

```javascript
docker-compose up -d
```

看sails后台
```javascript
docker ps (得到sailsindocker的container id)
docker logs -f [container id]
```

stop and remove all containers
```javascript
docker rm --force $(docker ps -aq)
```

p.s.developers不一定要在docker里开发,docker可以作为integration tool,保证app可用,然后作为deployment units

tag image and push to DockerHub:
```javascript
docker tag sailsindocker:latest jacky1999cn2000/sailsindocker:0.1
docker login
docker push jacky1999cn2000/sailsindocker:0.1
```
