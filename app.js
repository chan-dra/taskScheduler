var express = require('express');
var TaskProvider = require('./taskprovider-mongodb').TaskProvider;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var taskProvider = new TaskProvider('localhost', 27017);
// Routes

//start route
app.get('/', function(req, res){
    taskProvider.findAll( function(error,docs, compl){
        res.render('index.jade', { locals: {
            title: 'Task Scheduler',
            tasks:docs,
            completed: compl
            }
        });
    })
});

//add tasks to mongodb
app.post('/addTask', function(req, res){
    if (req.param('title') != "") {
        taskProvider.save({
            title: req.param('title'),
            body: req.param('body'),
            isDone: "false",
        }, function( error, docs) {
            res.redirect('/')
        });
    } else {
        res.redirect('/');
    }
});

//update task and set the task as 'done'
app.post('/updateTasks', function(req, res){
    taskProvider.setTaskDone(req.param('id'), function(error, docs) {
        res.redirect('/');
    });
    res.redirect('/');
});

//listen on port
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
