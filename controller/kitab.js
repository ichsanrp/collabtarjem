/**
 * Created by TESPOOL-02 on 7/3/16.
 */
var objectId = require('mongodb').ObjectId;

var kitab = {};
kitab.settings = {};

kitab.settings.upload = {
    method : 'post'
};
kitab.upload = function(req, res){

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
            res.send(result);
        })
    })
};

kitab.settings.getPage = {
    method:'get',
    params:['kitab','page','language']
};
kitab.getPage = function(req,res){
    executeDb(function (db, done) {
        var page = parseInt(req.params.page) - 1 || 0;
        var kitab = req.params.kitab|| 0;
        var language = req.params.language|| 'ar';
        db.collection('page').find({book:objectId(kitab)}).limit(1).skip(page).next(function(err,result){
            db.collection('kalimat').find({page:objectId(result._id),book:objectId(kitab),language:language}).toArray(function(err,kalimats){
                res.send(kalimats);
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

module.exports = kitab;