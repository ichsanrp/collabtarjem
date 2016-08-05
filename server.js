//TODO: add ssh server
var express = require("express");
var http        = require("http");
var https        = require("https");
var bodyParser  = require('body-parser');
var compression = require('compression');
var io   = require('socket.io');
var fs          = require('fs');
var path        = require('path');
var config = require('./config');
var ioadapter = require('socket.io-adapter');
var busboy = require('connect-busboy');
var csurf = require('csurf')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var app = express();
app.use(session({
    secret: config.session_secret,
    store: new MongoStore({ url: config.db}),
    resave:false,
    saveUninitialized:false
}));

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static('client'));
app.use(busboy());

var MongoClient = require('mongodb').MongoClient;
executeDb = function(handler){
    MongoClient.connect(config.db, function(err, db) {
        if(!err)
            handler(db,function(){
                db.close();
            });
    });
};

var loginAuth = function(req,res,next){
    var session = req.session;
    if(session.isLogged == null || session.isLogged == undefined || !session.isLogged){
        res.status(401).end();
    }else
        next();
};

var RoleAuth = function(role){
    return function (req,res,next){
        var session = req.session;
        if(session.role == undefined || session.role == null){
            res.status(403).end();
        }else{
            if(typeof role == 'object'){
                var check = role.find(function(data){
                    return data == session.role;
                })
                if(check == undefined){
                    res.status(403).end();
                }else{
                    next();
                }
            }else if(typeof role == 'string'){
                if(role == session.role){
                    next()
                }else{
                    res.status(403).end();
                }
            }
        }
    }
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
                        var bindAPI = function(settings,method,route){
                            var params = '';
                            var addAuthMiddleware = function(param){
                                if(settings.hasOwnProperty('registered_user')) {
                                    var registered_user = controller['settings'][methodname]['registered-user'];
                                    if(registered_user){
                                        app.use(route+param,loginAuth);
                                    }
                                }

                                if(settings.hasOwnProperty('role')){
                                    app.use(route+param,RoleAuth(controller['settings'][methodname]['role']));
                                }
                            };

                            var addMiddleware = function(param){
                                if(settings.hasOwnProperty('middleware')){
                                    settings.middleware.forEach(function(middleware){
                                        app.use(route+param,middleware);
                                    })
                                }
                            };

                            addAuthMiddleware(params);
                            addMiddleware(params);
                            app[method](route+params,controller[methodname]);

                            console.log('setting '+method+' to '+route+params);

                            if(settings.hasOwnProperty('params')){
                                settings.params.forEach(function(param){
                                    params += '/:'+param;
                                    addAuthMiddleware(params);
                                    addMiddleware(params);
                                    app[method](route+params,controller[methodname])
                                    console.log('setting '+method+' to '+route+params);
                                })
                            }
                        };

                        if(controller['settings'][methodname].hasOwnProperty('method')){
                                bindAPI(controller['settings'][methodname],controller['settings'][methodname]['method'].toLowerCase(),'/'+controllername+'/'+methodname);
                        }else{
                                bindAPI(controller['settings'][methodname],'all','/'+controllername+'/'+methodname);
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
    var translationCollab = require('./module/eventBroadcaster')(socket);
    httpServer.listen(config.port, function(err){
        if(err) throw err
            console.log('listen to port : ' + config.port)
    });
});

