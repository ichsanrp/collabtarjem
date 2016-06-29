var express = require("express");
var http        = require("http");
var https        = require("https");
var bodyParser  = require('body-parser');
var compression = require('compression');
var io   = require('socket.io');
var request     = require('request');
var fs          = require('fs');

var httpRouter = express();
httpRouter.use(compression());
httpRouter.use(bodyParser.json());
httpRouter.use(bodyParser.urlencoded({ extended: true }));
httpRouter.use('/',express.static('msTranslatorClient'));
var api = require('./api')(httpRouter);

var httpServer = http.createServer(httpRouter);
var socket = io(httpServer);

var MongoClient = require('mongodb').MongoClient;
executeDb = function(handler){
    MongoClient.connect(config.db, function(err, db) {
        if(!err)
            handler(db,function(){
                db.close();
            });
    });
};


httpServer.listen(8080, function(){

});