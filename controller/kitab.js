var jsdom = require("jsdom");
var objectId = require('mongodb').ObjectId;
var fs = require('fs');
var path = require('path');
var request = require('request');
var epub_exporter = require('../epub_exporter')();
var kitab = {};
kitab.settings = {};

kitab.settings.upload = {
    method:'post',
    registered_user:true
};

kitab.upload = function(req, res){
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        //Path where image will be uploaded
        fstream = fs.createWriteStream(path.join(__dirname,'../uploaded',filename));
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Upload Finished of " + filename);
            epub_exporter.export(filename,function(){
                console.log('success')
                res.send({success:true});
                //fs.unlink(path.join(__dirname,'../uploaded',filename),function(err){
                //    if(!err)
                //        res.send({success:true});
                //})
            });
        });
    });
};

kitab.settings.uploadFromShamela = {
    method:'post',
    registered_user:true
};

kitab.uploadFromShamela = function(req, res) {
    var url = req.body.url;
    console.log(url);
    var jquery = fs.readFileSync(path.join(__dirname,'../client','js','jquery.min.js'), "utf-8");

    jsdom.env(
        {
            url :  url,
            src : [jquery],
            done : function (err, window) {
                var $ = window.$;
                $('a').each(function(){
                    var $elem = $(this);
                    if($elem.attr('href').indexOf('.epub') >= 0)
                    {
                        console.log('download '+$elem.attr('href'))
                        var filename = $elem.attr('href').split('/');
                        filename = filename[filename.length-1];
                        var filestream = fs.createWriteStream(path.join(__dirname,'../uploaded',filename))
                        request($elem.attr('href')).pipe(filestream)
                        filestream.on('close', function () {
                            console.log("Upload Finished of " + filename);
                            epub_exporter.export(filename,function(){
                                console.log('success')
                                res.send({success:true});
                                //fs.unlink(path.join(__dirname,'../uploaded',filename),function(err){
                                //    if(!err)
                                //        res.send({success:true});
                                //})
                            });
                        });
                    }
                });
            }
        }
    );
};


kitab.settings.getAll = {
    method:'get',
    params:['limit','skip']
};
kitab.getAll = function(req, res){
    executeDb(function (db, done) {
        var limit = parseInt(req.params.limit)  || 10;
        var skip = parseInt(req.params.skip) || 0;

        db.collection('book').find().limit(limit).skip(skip).toArray(function(err,result){
            if(!err)
                res.send(result);
        })
    })
};

kitab.settings.find = {
    method:'get',
    params:['query','limit','skip']
};
kitab.find = function(req,res){
    executeDb(function (db, done) {
        var limit = parseInt(req.params.limit)  || 10;
        var skip = parseInt(req.params.skip) || 0;
        var query = parseInt(req.params.query) || {};

        db.collection('book').find(query).limit(limit).skip(skip).toArray(function(err,result){
            if(!err)
            {
                res.send(result);
            }
        })
    })
};

kitab.settings.getPage = {
    method:'get',
    params:['kitab','page','language'],

};
kitab.getPage = function(req,res){
    executeDb(function (db, done) {
        var page = parseInt(req.params.page) - 1 || 0;
        var kitab = req.params.kitab|| 0;
        var language = req.params.language|| 'ar';
        db.collection('page').find({book:objectId(kitab)}).limit(1).skip(page).next(function(err,result){
            db.collection('kalimat').find({page:objectId(result._id),book:objectId(kitab),language:language}).toArray(function(err,kalimats){
                if(!err && kalimats != null){
                    res.send(kalimats);
                }else{
                    res.send('cannot find page content');
                }
            })
        })
    })
};

kitab.settings.totalPage = {
    method:'get',
    params:['kitab']
};

kitab.totalPage = function(req,res){
    executeDb(function (db, done) {
        var kitab = req.params.kitab|| 0;
        //console.log(db.collection('page').count({book: objectId(kitab)}),kitab)
        db.collection('page').count({book: objectId(kitab)}).then(function(result){
            res.send({page:result})
        })
    });
};

kitab.settings.getTranslation = {
    method:'get',
    params:['kalimat','language']
};

kitab.getTranslation = function(req,res){
    executeDb(function (db, done) {
        var kalimat = req.params.kalimat || 0;
        var language = req.params.language || 'id';
        //console.log(db.collection('page').count({book: objectId(kitab)}),kitab)
        db.collection('kalimat').find({_id:objectId(kalimat)}).limit(1).next(function(err,result){
            if(!err && result !=null){
                if(result.translation.hasOwnProperty(language)){
                    db.collection('kalimat').find({_id:objectId(result.translation[language])}).limit(1)
                        .next(function(err, result){
                            if(!err){
                                res.send(result);
                            }
                        })
                }else
                {
                    res.send('translation not found')
                }
            }else {
                res.send('params not satisfied')
            }
        })
    });
};

module.exports = kitab;