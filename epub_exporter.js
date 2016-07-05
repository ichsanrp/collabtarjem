var zip = require('adm-zip');
var fs = require('fs');
var xml = require('xml2js').parseString;
var mongoclient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var path = require('path');
var config = require('./config');
var crypto = require('crypto');
var MsTranslator = require('mstranslator');


var msTranslatorClient = new MsTranslator({
    client_id: "colabtarjem"
    , client_secret: "9uDMJOyZd2qF9k+jVrNAvVn+dYGDFoWgXP7LiKZpOiA="
}, true);

function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

var exportBookMetadata = function (contentdescriptor) {
    return new Promise(function (resolve, reject) {
        executeDb(function (db, done) {
            var bookInformation = contentdescriptor.package.metadata[0];
            var record = {
                title: bookInformation['dc:title'][0],
                publisher: bookInformation['dc:publisher'][0],
                language: bookInformation['dc:language'][0],
                identifier: bookInformation['dc:identifier'][0]._,
                creator: bookInformation['dc:creator'][0]._
            };

            db.collection('book').find({identifier: bookInformation['dc:identifier'][0]._}).limit(1).next(function (err, result) {
                if (result == null) {
                    db.collection('book').insertOne(
                        record
                        , function (err, result) {
                            if (err) {
                                throw err;
                            }
                            else {
                                bookInformation._id = result.insertedId;
                            }
                            resolve(bookInformation);
                            done();
                        })

                } else {
                    resolve(result);
                    done();
                }
            });
        });
    });
};


var exportBookManifest = function (zipfile, contentDescriptor, bookInfo) {

    return new Promise(function (resolve, reject) {
        var maxTranslate = -1;
        var currTranslate = 0;

        var manifest = contentDescriptor.package.manifest[0];

        var insertPage = function (page, db) {

            return new Promise(function (resolve, reject) {
                db.collection('page').insertOne(page, function (err, result) {
                    if (err) {
                        throw err;
                        reject();
                    }
                    else {
                        page._id = result.insertedId;
                        resolve(page);
                    }
                });
            });
        };

        var insertKalimat = function (kalimat, book, page, db) {
            return new Promise(function (resolve, reject) {
                db.collection('kalimat').find({
                    page: objectId(page._id),
                    book: objectId(book._id),
                    identity: checksum(kalimat.text, 'sha1')
                }).limit(1).next(function (err, doc) {
                    if (doc == null) {
                        db.collection('kalimat').insertOne({
                            translation: {},
                            text: kalimat.text,
                            type: kalimat.type,
                            language: 'ar',
                            page: page._id,
                            book: book._id,
                            identity: checksum(kalimat.text, 'sha1')
                        }, function (err, result) {
                            if (err) {
                                throw err;
                                reject();
                            }
                            else {
                                //disabling auto translate
                                //db.collection('kalimat').find({_id: objectId(result.insertedId)}).limit(1).next(function (err, doc) {
                                //
                                //    var params = {
                                //        text: doc.text
                                //        , from: 'ar'
                                //        , to: 'id'
                                //    };
                                //    //now we call microsoft translator to translate arabic to indonesia
                                //    if(maxTranslate != -1){
                                //        if(currTranslate < maxTranslate){
                                //            currTranslate ++;
                                //            insertTranslation(doc,'id');
                                //        }
                                //    }else{
                                //        insertTranslation(doc,'id');
                                //    }
                                //
                                //    cb(doc);
                                //    done();
                                //})
                                resolve();
                            }
                        })
                    } else {
                        //insertTranslation(doc, 'id');
                        resolve();
                    }
                });
            });
        };

        var extractContent = function (content) {
            var bookcontaineridx = content.indexOf('id="book-container"');
            var start = bookcontaineridx + 26
            var end = content.indexOf('</div>', start);

            return content.substring(start, end);
        };

        var parsingPage = function (record, db) {
            return new Promise(function (resolve, reject) {
                var content = zipfile.readAsText(contentDescriptor.rootDir + '/' + record.$['href']);
                var result = extractContent(content);
                var contents = [];
                var contentsdot = result.split('.');

                contentsdot.forEach(function (sentence) {

                    var sentences = sentence.split('،');

                    for (var l = 0; l < sentences.length; l++) {
                        if (l != (sentences.length - 1))
                            contents.push({text: sentences[l], type: 'mid_sentence'})
                        else
                            contents.push({text: sentences[l], type: 'end_sentence'})
                    }
                });

                db.collection('page').find({
                    book: objectId(bookInfo._id),
                    identity: checksum(record.$['id'], 'sha1')
                }).limit(1).next(function (err, res) {
                    if(err) throw err;
                    if (res == null) {
                        var page = {
                            'name': record.$['id'],
                            'path': record.$['href'],
                            'book': bookInfo._id,
                            'identity': checksum(record.$['id'], 'sha1')
                        };

                        insertPage(page, db).then(function (newPage) {
                            var kalimatInsertOperation = [];
                            contents.forEach(function (kalimat) {
                                kalimatInsertOperation.push(insertKalimat(kalimat, bookInfo, newPage, db));
                            });
                            Promise.all(kalimatInsertOperation).then(function () {
                                resolve();
                            })
                        })
                    } else {
                        var kalimatInsertOperation = [];
                        contents.forEach(function (kalimat) {
                            kalimatInsertOperation.push(insertKalimat(kalimat, bookInfo, res, db));
                        });
                        Promise.all(kalimatInsertOperation).then(function () {
                            resolve();
                        });
                    }
                });
            });
        }


        executeDb(function(db,done){
            var parsePageOperation = []
            manifest.item.forEach(function (record) {
                if (record.$['media-type'] == 'application/xhtml+xml') {
                    parsePageOperation.push(parsingPage(record,db))
                }
            });

            Promise.all(parsePageOperation).then(function(){
                done();
                resolve();
            })
        });
    });
};

module.exports = epub_exporter;

function epub_exporter() {
    var api = {};

    var readBookInfo = function (zipfile) {

        return new Promise(function (resolve, reject) {
            var contentdescriptor;
            var rootDir;
            xml(zipfile.readAsText('META-INF/container.xml'), function (err, result) {
                result.container.rootfiles.forEach(function (rtfile) {
                    contentdescriptor = rtfile.rootfile[0].$['full-path'];
                    var dir = rtfile.rootfile[0].$['full-path'].split('/');
                    rootDir = dir[0];

                });
            });
            contentdescriptor = zipfile.readAsText(contentdescriptor);
            xml(contentdescriptor, function (err, result) {
                result.rootDir = rootDir;
                exportBookMetadata(result).then(function (metadata) {
                    if (metadata == false)
                        return new Promise(function (resolve, reject) {
                            resolve()
                        })
                    else {
                        return exportBookManifest(zipfile, result, metadata)
                    }
                }).then(function () {
                    resolve()
                })
            })
        });
    };

    api.exportAll = function () {

        fs.readdir(path.join(__dirname, 'uploaded'), function (err, files) {
            files.forEach(function (file) {
                var filepath = path.join(__dirname, 'uploaded', file);
                var zipfile = new zip(filepath);
                readBookInfo(zipfile)
            })
        });
    };

    api.export = function (filename, cb) {
        console.log('exporting ' + filename + ' to database')
        var filelocation = path.join(__dirname, 'uploaded', filename);
        var zipfile = new zip(filelocation);
        readBookInfo(zipfile).then(function (res) {
            cb()
        });
    };

    api.insertTranslation = function (kalimat, to) {
        var params = {
            text: kalimat.text
            , from: kalimat.language
            , to: to
        };

        //check if kalimat already has translation
        if (kalimat.translation[to] == null || kalimat.translation[to] == undefined) {
            msTranslatorClient.translate(params, function (err, translation) {
                if (!err) {
                    var newid = objectId();
                    var translateTranslator = kalimat.translation;
                    translateTranslator[kalimat.language] = kalimat._id;
                    translateTranslator[to] = newid;

                    executeDb(function (db, done) {
                        db.collection('kalimat').insertOne({
                            _id: newid,
                            language: to,
                            text: translation,
                            page: kalimat.page,
                            book: kalimat.book,
                            identity: checksum(translation, 'sha1'),
                            translation: translateTranslator
                        }, function (err, result) {
                            done();
                        });
                    });

                    executeDb(function (db, done) {
                        db.collection('kalimat').updateOne(
                            {_id: objectId(kalimat._id)},
                            {$set: {translation: translateTranslator}},
                            function (err, result) {
                                done();
                            }
                        );
                    });
                }
            });
        }
    };

    return api;
}

