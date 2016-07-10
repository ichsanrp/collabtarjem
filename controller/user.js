var objectId = require('mongodb').ObjectId;
var crypto = require('crypto');
var request = require('request');
var config = require('../config');
var fb_parser = require('fb-signed-parser');

user = {};
user.settings = {};

user.settings.login = {
    method:'post'
};

user.login = function(req,res){
    var username = req.body.username;
    var password = req.body.password;

    executerDb(function (db,done){
        db.collection('user').find({username:username}).limit(1).next(function(err,user){
            if(err) throw err;
            if(user != null){
                if(user.status == 'verified'){
                    var hmac = crypto.createHmac('sha256', config.password_secret);
                    hmac.update(password);
                    if(hmac.digest('hex') == user.password){
                        req.session.isLogged = true;
                        req.session.role = user.role;
                        res.status(200).end();
                    }else{
                        res.status(403).end();
                    }
                    done()
                }else{
                    res.status(403).send('email verification needed').end();
                }


            }
        })
    });
};

user.settings.loginWithGoogle = {
    method:'post'
};

user.loginWithGoogle = function(req,res) {
    var token = req.body.token;
    request('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+token,function(err,response,body){
        var data = JSON.parse(body);
        req.session.isLogged = true;
        req.session.role = 'basic';
        req.session.authType = 'google';
        req.session.access_token = token;
        req.session.username = data.name;
        if(config.google_app_client_id == data.aud){
            res.status(200).end();
        }
    })
};

user.settings.loggedWithGoogle = {
    method:'get'
};
user.loggedWithGoogle = function(req,res) {
    if(req.session.authType == 'google')
        res.send({isLogged:true,token:req.session.access_token});
    else
        res.send({isLogged:false});
};


user.settings.loginWithFacebook = {
    method:'post'
};

user.loginWithFacebook = function(req,res){
    var authRespons =req.body.authResponse;
    var data = fb_parser.parse(authRespons.signedRequest,config.facebook_app_secret);
    if(data != null)
    {
        req.session.isLogged = true;
        req.session.role = 'basic';
        req.session.username = data.user_id;
        req.session.authType = 'facebook';
        //TODO: save user to database

        res.status(200).end();
    }else{
        res.status(403).end();
    }
};

user.settings.logout = {
    method:'get'
};
user.logout = function(req,res){
    req.session.isLogged = false;
    res.status(200).end();
};

user.settings.register = {
    method:'post'
};
user.register = function(req,res){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var gender = req.body.gender;
    var hmac = crypto.createHmac('sha256', config.password_secret);
    hmac.update(password);
    password = hmac.digest('base64');

    var emailver = crypto.createHmac('sha256', password);
    emailver.update(username);
    emailver = emailver.digest('hex');

    //check username and email unique

    executerDb(function (db,done){
        //creating index
        db.collection('user').createIndex( { email: 1 , username:1},{unique:true} );
        db.collection('user').insertOne({
            username:username,
            password:password,
            gender:gender,
            email:email,
            role:'basic',
            status:'notConfirmEmail',
            emailVerificationCode:emailver
        }, function (err,result) {
            if(err) throw err;
            if(user != null){
                res.status(200).end();
                done()
            }
        });
    });
};

user.settings.verifyEmail = {
    method:'get',
    params:['username','key']
};
user.verifyEmail = function(req,res){
    var username = req.params.username;
    var key = req.params.key;
    executerDb(function (db,done){
        db.collection('user').find({username:username}).limit(1).next(function(err,user){
            if(err) throw err;
            if(user != null){
                if(key == user.emailVerificationCode){

                    db.collection('user').updateOne(
                        {_id:objectId(user._id)},
                        {
                            $set:{
                                status:'verified'
                            },
                            $unset: {
                                emailVerificationCode: 1
                            }
                        }, function(err,result){
                            if(!err)
                                res.status(200).end();
                            done();
                        }
                    );
                }else{
                    res.status(403).end();
                    done()
                }

            }
        })
    });
};

user.settings.kick = {
    method:'post',
    registered_user:true,
    role:['admin','moderator']
};
user.kick = function(req,res){

};

user.settings.ban = {
    method:'post',
    params:['username'],
    registered_user:true,
    role:['admin','moderator']
};
user.ban = function(req,res){
    var username = req.params.username;
    executerDb(function (db,done){
        db.collection('user').find({username:username}).limit(1).next(function(err,user){
            if(err) throw err;
            if(user != null){
                db.collection('user').updateOne(
                    {_id:objectId(user._id)},
                    {
                        $set:{
                            status:'ban'
                        }
                    }, function(err,result){
                        if(!err)
                            res.status(200).end();
                        done();
                    }
                );
            }
        })
    });
};


module.exports = user;