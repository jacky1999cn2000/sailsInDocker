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
