'use strict';

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    request = require('supertest');;

chai.use(chaiAsPromised);

var sinon = require('sinon');
    should = chai.should();

describe('SystemsController', function(){

  describe('#available', function(){
    it('should return OK', function(done){
      request(sails.hooks.http.app)
        .get('/available')
        .expect(function(res){
          //console.log('res: ',res);
        })
        .expect(200, done);
    })
  });

  describe('#monster', function(){

  });
})
