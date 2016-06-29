var urlencode = require('urlencode');
var request = require('request');
var MsTranslator = require('mstranslator');
var client = new MsTranslator({
    client_id: "colabtarjem"
    , client_secret: "9uDMJOyZd2qF9k+jVrNAvVn+dYGDFoWgXP7LiKZpOiA="
}, true);

module.exports = api;

function api(Router)
{
    methods = {};
    Router.post('/translate/:from/:to', function(req,res){
        var params = {
            text: req.body.content
            , from: req.params.from
            , to: req.params.to
        };
        client.translate(params, function(err, data) {
            res.send(data);
        });
    });

    return methods;
}