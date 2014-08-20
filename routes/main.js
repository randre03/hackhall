/**
 * Created by randre03 on 8/19/14.
 */
exports.checkAdmin = function(req, res, next) {
    if(req.session && req.session.auth && req.session.userId && req.session.admin) {
        console.info('Access ADMIN: ' + req.session.userID);
        return next();
    } else {
        next('User is not an Admin.');
    }
};

exports.checkUser = function(req, res, next) {
    if(req.session && req.session.auth && req.session.userId && (req.session.approved || req.session.admin)) {
        console.info('Access USER: ' + req.session.userID);
        return next();
    } else {
        next('User is not an logged in.');
    }
};

exports.checkApplicant = function(req, res, next) {
    if(req.session && req.session.auth && req.session.userId && (!req.session.approved || req.session.admin)) {
        console.info('Access USER: ' + req.session.userID);
        return next();
    } else {
        next('User is not an logged in.');
    }
};

exports.login = function(req, res, next) {
    req.db.findOne({
            email:      req.body.email,
            password:   req.body.password
        },
        null,{
            safe:   true
        },
        function(err, user) {
            if(err) {
                return next(err);
            }
            if(user) {
                req.session.auth = true;
                req.session.userId = user._Id.toHexString();
                req.session.user = user;
                if(user.admin) {
                    req.session.admin = true;
                }
                console.info('Login USER: ' + req.session.userId);
                res.json(200, {msg: 'Authorized'});
            } else {
                next(new Error('User not found.'));
            }
        });
};

exports.logout =function(req, res) {
    console.info('Logout USER: ' + req.session.userId);
    req.session.destroy(function(error) {
        if(!error) {
            res.send({
                msg:    'Logged Out'
            });
        }
    });
};

exports.profile = function(req, res, next){
    req.db.findById(req.session.userId, 'firstName lastName'
    + 'displayName headline photoUrl admin'
    + 'approved banned role angelUrl twitterUrl'
    + 'facebookUrl linkedinUrl githubUrl', function(err, obj) {
        if(err) {
            next(err);
        }
        if(!obj) {
            next(new Error('User not found'));
        }
        req.db.Post.find({
            author: {
                id:     obj._id,
                name:   obj.displayName
            }
        }, null, {
            sort: {
                'created':  -1
            }
        }, function(err, list) {
            if(err) {
                next(err);
            }
            obj.posts.own = list || [];
            req.db.Post.find({
                likes:  obj._id
            }, null, }

        sort: {
            'created': -1
        }
    }, function( err, list) {
        if (err) next( err);
        obj.posts.likes = list | | [];
        req.db.Post.find({
            watches: obj. _id
        }, null, {
            sort: {
                'created': -1
            }
        }, function( err, list) {
            if (err) next( err);
            obj.posts.watches = list | | [];
            req.db.Post.find({
                'comments.author.id': obj. _id
            }, null, {
                sort: {
                    'created': -1
                }
            }, function( err, list) {
                if (err) next( err);
                obj.posts.comments = [];
                list.forEach( function( value, key, list) {
                        obj.posts.comments.push(
                            value.comments.filter(
                                function( el, i, arr) {
                                    return (el. author.id.toString() = = obj. _id.toString());
                                }
                    }
                )
                );
            });
            res.json( 200, obj);
        })
    })
}

});
});
});
});
});
};

exports.delProfile = function( req, res, next) {
    console.log('del profile');
    console.log( req.session.userId);
    req.db.User.findByIdAndRemove( req.session.user. _id, {},
        function( err, obj) {
        if (err) next( err);
        req.session.destroy( function( error) {
        if (err) {
            next( err)
        }
        });
        res.json( 200, obj);
        }
    );
};