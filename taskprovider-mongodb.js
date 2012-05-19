var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

TaskProvider = function(host, port) {
  this.db= new Db('node-mongo-tasks', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

//get db collection
TaskProvider.prototype.getCollection= function(callback) {
  this.db.collection('tasks', function(error, task_collection) {
    if( error ) callback(error);
    else callback(null, task_collection);
  });
};

//get all elements from the collection
TaskProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, task_collection) {
      if( error ) callback(error)
      else {
        task_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else {
            var tasks = [];
            var completed = [];
            for( var i =0;i< results.length;i++ ) {
                if (results[i].isDone == "false") {
                    tasks.push(results[i]);
                } else {
                    completed.push(results[i]);
                }
            }
            callback(null, tasks, completed)
          }
        });
      }
    });
};

//Sets a particular task record to 'done'
TaskProvider.prototype.setTaskDone = function(id, callback) {
    this.getCollection(function(error, task_collection) {
      if( error ) callback(error)
      else {
        task_collection.update({_id: task_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, {$set: {isDone: "true"}} , function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//adds rows and commits to db.
TaskProvider.prototype.save = function(tasks, callback) {
    this.getCollection(function(error, task_collection) {
      if( error ) callback(error)
      else {
        if( typeof(tasks.length)=="undefined")
          tasks = [tasks];

        for( var i =0;i< tasks.length;i++ ) {
          task = tasks[i];
        }

        task_collection.insert(tasks, function() {
          callback(null, tasks);
        });
      }
    });
};

exports.TaskProvider = TaskProvider;
