var urlencode = require('urlencode');
var request = require('request');
var epub_exporter = require('./epub_exporter')();

module.exports = api;

function api(Router)
{
    methods = {};
    Router.post('/upload', function(req,res){
        console.log(req.files);
    });

    return methods;
}