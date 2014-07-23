var express = require('express'),
  app = express(),
  express = require('express'),
  should = require('should'),
  assert = require('assert'),
  request = require('supertest'),
  http = require('http'),
  config =  require('../config.js')(app),
  port = app.get('port'),
  host = app.get('hostName'),
  url = host + ':' + port;

  app.set('env', 'test');

  describe('Api', function () {

    describe('uploadFile', function() {

      it('should return fileUrl when file uploaded ', function (done) {
        request(url)
          .post('/uploadFile')
          .attach('file', __dirname + '/fixtures/dart.jpg')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.should.have.property('fileUrl');
            done();
          });
      });
    });

    describe('uploadImage', function() {

      it('should return imageUrl when image uploaded', function (done) {
        request(url)
          .post('/uploadImage')
          .attach('foto', __dirname + '/fixtures/dart.jpg')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.should.have.property('imageUrl');
            done();
          });
      });

      it('should return error with code 1 when not image file uploaded', function (done) {
        request(url)
          .post('/uploadImage')
          .attach('foto', __dirname + '/fixtures/test.txt')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }
            res.body.should.have.property('error', 1);
            done();
          });
      });

      it('should crop image when crop options enabled', function (done) {
        request(url)
          .post('/uploadImage')
          .field('cropW', 150)
          .field('cropH', 150)
          .field('cropX', 0)
          .field('cropY', 0)
          .attach('foto', __dirname + '/fixtures/love.jpg')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.body.should.have.property('imageUrl');
            done();
          });
      });

      it('should resize image when resize options enabled', function (done) {
        request(url)
          .post('/uploadImage')
          .field('resizeW', 200)
          .field('resizeH', 112)
          .attach('foto', __dirname + '/fixtures/love.jpg')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.body.should.have.property('imageUrl');
            done();
          });
      });


    });
  });
