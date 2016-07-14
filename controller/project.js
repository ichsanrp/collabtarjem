var objectId = require('mongodb').ObjectId;
project = {};
project.settings = {};

var checkOwnership = function (projectrole) {
    return function (req, res, next) {
        var project = req.body.project;
        var username = req.body.username;
        executeDb(function (db, done) {
            db.collection('project').find({_id: objectId(project)}).limit(1).next(function (err, result) {
                if (typeof projectrole == 'string') {
                    var check = result[projectrole].find(function (user) {
                        return user == username;
                    });

                    if (check != undefined) {
                        next()
                    } else {
                        res.status(402).end();
                        done()
                    }
                } else {
                    var pass = false;
                    projectrole.forEach(function (role) {
                        var check = result[role].find(function (user) {
                            return user == username;
                        });
                        if (check != undefined) {
                            pass = true
                        }
                    });
                    if (pass)
                        next();
                    else {
                        res.status(402).end();
                        done();
                    }

                }
            })
        });
    }
};

project.settings.create = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin']
};

project.create = function (req, res) {
    var book = req.body.book;
    var name = req.body.name;
    var language = req.body.language;
    var admin = req.body.admin;
    var moderators = req.body.moderators || [];
    var contributors = req.body.contributors || [];
    var project = {
        book: objectId(book),
        name: name,
        language: language,
        moderator: moderators,
        contributor: contributors,
        admin: admin
    };

    executeDb(function (db, done) {
        db.collection('project').createIndex({name: 1}, {unique: true});
        db.collection('project').insertOne(project, function (err, result) {
            if (err) throw err;
            if (user != null) {
                project._id = result.insertedId;
                done()
                res.send(project);
            }
        })
    });
};

project.settings.changeName = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership('admin')]
};

project.changeName = function (req, res) {
    var project = req.body.project;
    var newName = req.body.name;

    executeDb(function (db, done) {
        db.collection('project').updateOne({_id: objectId(project)},
            {
                $set: {
                    name: newName
                }
            }, function (err, result) {
                if (!err)
                    res.status(200).end();
                done();
            })
    });
};

project.settings.addContributor = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership(['admin', 'moderator'])]
};

project.addContributor = function (req, res) {
    var project = req.body.project;
    var username = req.body.username;

    executeDb(function (db, done) {
        db.collection('project').find({_id: objectId(project)}).limit(1).next(function (err, project) {
            if (err) throw err;
            if (project != null) {
                project.contributor.push(username);
                db.collection('project').updateOne({_id: objectId(project)},
                    {
                        $set: {
                            contributor: project.contributor
                        }
                    }, function (err, result) {
                        if (!err)
                            res.status(200).end();
                        done();
                    })
            }
        })
    });
};

project.settings.addModerator = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership(['admin'])]
};

project.addModerator = function (req, res) {
    var project = req.body.project;
    var username = req.body.username;

    executeDb(function (db, done) {
        db.collection('project').find({_id: objectId(project)}).limit(1).next(function (err, project) {
            if (err) throw err;
            if (project != null) {
                project.moderator.push(username);
                db.collection('project').updateOne({_id: objectId(project)},
                    {
                        $set: {
                            moderator: project.moderators
                        }
                    }, function (err, result) {
                        if (!err)
                            res.status(200).end();
                        done();
                    })
            }
        })
    });
};

project.settings.addTranslation = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership(['admin', 'moderator', 'member'])]
};
project.addTranslation = function (req, res) {
    var sentence = req.body.sentence;
    var projecId = req.body.project;
    var translation = req.body.translation;
    var username = req.body.username;

    executeDb(function (db, done) {
        db.collection('project').find({_id: objectId(projecId)}).limit(1).next(function (err, project) {
            db.collection('kalimat').find({_id: objectId(sentence)}).limit(1).next(function (err, kalimat) {
                var data = {
                    language: project.language,
                    text: translation,
                    page: kalimat.page,
                    book: kalimat.book,
                    project: projecId,
                    status: 'suggestion',
                    owner: username,
                    identity: checksum(translation, 'sha1'),
                    origin: sentence
                };

                db.collection('kalimat').insertOne(data, function (err, result) {
                    if (err) throw err;
                    data._id = result.insertedId;
                    res.send(data);
                    done();
                });
            });
        });
    });
};

project.settings.getReleaseTranslation = {
    method: 'get'
};

project.getReleaseTranslation = function (req, res) {
    var sentence = req.body.sentence;
    var projecId = req.body.project;

    executeDb(function (db, done) {
        db.collection('kalimat').find(
            {
                origin: objectId(sentence),
                project: objectId(projecId),
                status: 'release'
            }).limit(1).next(function (err, kalimat) {
            if (err) throw err;
            res.send(kalimat);
            done();
        });
    });
};

project.settings.getAllTranslation = {
    method: 'get',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership(['admin', 'moderator', 'member'])]
};

project.getAllTranslation = function (req, res) {
    var sentence = req.body.sentence;
    var projecId = req.body.project;

    executeDb(function (db, done) {
        db.collection('kalimat').find(
            {
                origin: objectId(sentence),
                project: objectId(projecId)
            }).limit(1).next(function (err, kalimat) {
            if (err) throw err;
            res.send(kalimat);
            done()
        });
    });
};

project.settings.setTranslationStatus = {
    method: 'post',
    registered_user: true,
    role: ['basic', 'admin'],
    middleware: [checkOwnership(['admin', 'moderator'])]
};

project.setTranslationStatus = function (req, res) {
    var translationId = req.body.translation;
    var status = req.body.status;

    executeDb(function (db, done) {
        db.collection('kalimat').updateOne(
            {
                _id: objectId(translationId)
            }, {
                $set: {
                    status: status
                }
            }, function (err, result) {
                if (err) throw  err;
                res.status(200).end();
                done();
            })
    });
};

project.settings.createTranslation = {
    method: 'post'
};

project.createTranslation = function (req, res) {
    var kalimat = req.body.kalimat;
    var translation = req.body.translation;
    var user = req.body.user;
    var created = new Date();

    executeDb(function (db, done) {
        var data = {
            original: objectId(kalimat),
            user: objectId(user),
            text: translation,
            createdAt: created,
            status:'draft'
        };
        db.collection('projectTranslation').insertOne(data, function (err, result) {
            if (err) throw err;
            data._id = result.insertedId;
            res.send(data);
            done();
        })
    });

};

project.settings.getTranslation = {
    method: 'get',
    params: ['kalimat', 'project']
};

project.getTranslation = function (req, res) {
    executeDb(function (db, done) {
        var kalimat = req.params.kalimat;
        var project = req.params.project;
        db.collection('projectTranslation').find({
            original: objectId(kalimat),
            project: objectId(project),
            status:'approved'
        }).toArray(function (err, result) {
            if(err) throw err;
            if (result != null) {
                res.send(result);
                done()
            } else {

                db.collection('project').find({_id:objectId(project)}).limit(1).next(function (err,projectRes) {
                    if(err) throw err;
                    db.collection('kalimat').find({_id:objectId(kalimat)}).limit(1).next(function (err,originalKalimat) {
                        if(err) throw  err;
                        if(originalKalimat.translation.hasOwnProperty(projectRes.language)){
                            db.collection('kalimat').find({_id:objectId(originalKalimat.translation[projectRes.language])}).limit(1)
                                .next(function(err, translation){
                                    if(!err){
                                        res.send(translation);
                                        done()
                                    }
                                })
                        }else
                        {
                            res.send(originalKalimat)
                            done()
                        }
                    })
                });

                done()
            }
        })
    });
};


module.exports = project;