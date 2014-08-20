/**
 * Created by randre03 on 8/18/14.
 */
var express     =   require('express'),
    routes      =   require('./routes'),
    http        =   require('http'),
    util        =   require('util'),
    oauth       =   require('oauth'),
    querystring =   require('querystring'),
    mongoose    =   require('mongoose'),
    models      =   require('./models');


var app = express();
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('asd;lfkajs;ldfkj'));
    app.use(express.session({
        secret: '<h1>WHEEYEEE</h1>,',
        key: 'sid',
        cookie: {
            secret: true,
            expires: false
        }
    }));
//  app.use(express.csrf());
//  app.use(function(req, res, next) {
//      res.locals.csrf = req.session._csrf;
//      return next();
//  });
    app.use(express.static(__dirname, '/public'));
    app.use(app.router);
});

//Error Handling

app.configure(function() {
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);
});

function logErrors(err, req, res, next) {
    console.error('logErrors', err.toString());
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    console.error('clientErrors ', err.toString());
    res.send(500, { error: err.toString()  });
    if(req.xhr) {
        console.error(err);
        res.send(500, { error: err.toString()});
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    console.error('lastErrors ', err.toString());
    res.send(500, {error: err.toString()});
}

//Set-up a durable Mongo DB ort that can handle connection to Heroku and local development
var dbUrl = process.env.MONGOHQ_URL || 'mongodb://@127.0.0.1:27017/hackhall';
var connection = mongoose.createConnection(dbUrl);
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
    console.info('connected to database');
});

function db(req, res, next) {
    req.db = {
        User:   connection.model('User', models.User, 'users'),
        Post:   connection.model('Post', models.Post, 'posts')
    };
    return next();
}

checkUser       =   routes.main.checkUser;
checkAdmin      =   routes.main.checkAdmin;
checkApplicant  =   routes.main.checkApplicant;

//AngeLList OAuth Routes
app.get('/auth/angellist', routes.auth.angelList);
app.get('/auth/angellist/callback', routes.auth.angelListCallback, routes.auth.angelListLogin, db, routes.users.findOrAddUser);

//Main
app.get('/api/profile', checkUser, db, routes.main.profile);
app.del('/api/profile', checkUser, db, routes.main.delProfile);
app.post('/api/login', db, routes.main.login);
app.post('/api/logout', routes.main.logout);

//POST requests for creating users and posts
app.get('/api/posts', checkUser, db, routes.posts.getPosts);
app.post('/api/posts', checkUser, db, routes.posts.add);
app.get('/api/posts/:id', checkUser, db, routes.posts.getPost);
app.put('/api/posts/:id', checkUser, db, routes.posts.updatePost);
app.del('/api/posts/:id', checkUser, db, routes.posts.del);

//Users
app.get('/api/users', checkUser, db, routes.users.getUser);
app.get('/app/users/:id', checkUser, db, routes.users.getUser);
app.post('/api/users', checkAdmin, db, routes.users.add);
app.put('/api/users/:id', checkAdmin, db, routes.users.update);
app.del('/api/users/:id', checkAdmin, db, routes.users.del);

//Application
app.post('/api/application', checkAdmin, db, routes.application.add);
app.put('/api/application', checkAdmin, db, routes.application.update);
app.get('/api/application', checkAdmin, db, routes.application.get);
app.get('*', function(req, res) {
    res.send(404);
});

http.createServer(app);
if(require.main === module) {
    app.listen(app.get('port'), function() {
        console.info('Express server listening on port %d', app.get('port'));
    });
} else {
    console.info('Running app as a module');
    exports.app = app;
}