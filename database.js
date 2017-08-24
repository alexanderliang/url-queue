var mongoose = require('mongoose');
var dbAddress = require('./keys').mongodbAddress;

mongoose.connect(dbAddress);

var db = mongoose.connection;

db.on('error', function(){
  console.log('Mongoose connection error');
});

db.on('open', function(){
  console.log('Mongoose connected successfully');
});

var urlSchema = mongoose.Schema({
  id: {type: Number, unique: 1},
  timeUpdated: Date,
  url: String,
  data: String,
  type: String
})

var Url = mongoose.model('Url', urlSchema);

Url.insert = function(UrlObject){
  var data = new Url(UrlObject)
  data.save(function(err, data){
    if(data){
      updateObject = {
        id: UrlObject.id,
        attempted: true,
        success: true
      }
      Queue.update(updateObject)

    } else {
      updateObject = {
        id: UrlObject.id,
        attempted: true,
        success: false
      }
      Queue.update(updateObject)

    }
  });
};


Url.fetch = function(id, callback){
  Url.findOne({id: id}, function(err, data){
    callback(err, data)
  });
};

var counterSchema = mongoose.Schema({
  count: Number
});

var Counter = mongoose.model('Counter', counterSchema);

Counter.count = function(callback){
  Counter.find().then(function(resolve, reject){
    if(resolve[0]){
      callback(resolve[0].count);
      resolve[0].count++;
      resolve[0].save();
    } else {
      var data = new Counter({count: 1});
      data.save(function(err, data){
      })
    }
  });
}

var queueSchema = mongoose.Schema({
  id : Number,
  url : String,
  date: Date,
  attempted: {type: Boolean, default: false},
  success: {type: Boolean, default: false},
})
var Queue = mongoose.model('Queue', queueSchema);

Queue.add = function(qObject, callback){
  qObject.date = new Date();
  //qObject.attempted = false;
  //qObject.success = false;

  var data = new Queue(qObject);
  data.save(function(err, data){
    callback(err, data);
  });
}

//Worker uses function to find all unattempted tickets
Queue.fetchNew = function(callback){
  Queue.find({attempted: false}, function(err, data){
    callback(err, data)
  })
}

Queue.fetchOne = function(id, callback){
  Queue.findOne({id:id}, function(err, data){
    callback(err, data)
  });
}

Queue.update = function(updateObject, callback){
  Queue.findOne({id:updateObject.id})
  .then(function(resolve, reject){
    resolve.attempted = updateObject.attempted;
    resolve.success = updateObject.success;
    resolve.save();
  });
}

module.exports = {
  Url: Url,
  Counter: Counter,
  Queue: Queue
}