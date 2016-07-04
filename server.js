var express = require("express");
var http        = require("http");
var https        = require("https");
var bodyParser  = require('body-parser');
var compression = require('compression');
var io   = require('socket.io');
var request     = require('request');
var fs          = require('fs');
var path        = require('path');
var config = require('./config');
var busboy = require('connect-busboy');
var app = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('client'));
app.use(busboy());
var api = require('./api')(app);

var MongoClient = require('mongodb').MongoClient;
executeDb = function(handler){
    MongoClient.connect(config.db, function(err, db) {
        if(!err)
            handler(db,function(){
                db.close();
            });
    });
};


function controllerHook(){
    return new Promise(function(resolve,reject){
        fs.readdir(path.join(__dirname,'controller'), function (err, files) {
            files.forEach(function(file){
                var controllername = file.replace('.js','');
                var controller = require('./controller/' + controllername);
                var methods = Object.getOwnPropertyNames(controller);
                methods.forEach(function(methodname){
                    if(controller['settings'][methodname] != undefined)
                    {
                        var handlingParams = function(paramsconfig,method,route){
                            var params = '';
                            if(controller['settings'][methodname].hasOwnProperty('params')){
                                paramsconfig.forEach(function(param){
                                    params += '/:'+param;
                                    app[method](route+params,controller[methodname])
                                    console.log('setting '+method+' to '+route+params);
                                })
                            }
                        };
                        if(controller['settings'][methodname].hasOwnProperty('method')){
                            //handling without params
                            app[controller['settings'][methodname]['method'].toLowerCase()]('/'+controllername+'/'+methodname,controller[methodname])
                            if(controller['settings'][methodname].hasOwnProperty('params')){
                                handlingParams(controller['settings'][methodname]['params'],controller['settings'][methodname]['method'].toLowerCase(),'/'+controllername+'/'+methodname);
                            }
                            console.log('setting '+controller['settings'][methodname]['method']+' to '+'/'+controllername+'/'+methodname);
                        }else{
                            var params = '';
                            if(controller['settings'][methodname].hasOwnProperty('params')){
                                handlingParams(controller['settings'][methodname]['params'],'all','/'+controllername+'/'+methodname);
                            }
                            app.all('/'+controllername+'/'+methodname, controller[methodname]);
                            console.log('setting all to '+'/'+controllername+'/'+methodname);
                        }
                    }else{
                        //no method name, use get as default
                        if(methodname != 'settings'){
                            app.all('/'+controllername+'/'+methodname, controller[methodname]);
                            console.log('setting all to '+'/'+controllername+'/'+methodname);
                        }
                    }
                });

                resolve();
            })
        });
    });
}

controllerHook().then(function(){

    var httpServer = http.createServer(app);
    var socket = io(httpServer);
    httpServer.listen(config.port, function(){
        console.log('listen to port : ' + config.port)
    });
});

