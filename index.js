var express = require('express');
var cron =  require('node-cron');
var bodyParser = require('body-parser');

var worker = require('./worker.js');
var db = require('./database.js');

var app = express();

//Responds with ticket number.
//Ticket Counter persisted in DB
app.use(bodyParser());
app.post('/new', function(req, res){
  var re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi;
  var url = req.body.url
  if(url.match(re)){
    db.Counter.count(function(data){
      var qParam = {
        id: data,
        url: url
      };
      db.Queue.add(qParam, function(err, data){
        if(err){
          res.status(400).json('There was a problem with your request please try again');
        } else {
          res.status(200).json('Your ticket number: ' + data.id);
        }
      });
    })
  } else {
    res.status(200).json('Please enter a valid URL');
  }
})

//Get Api URL address path to input ticket number
app.get('/retrieve/*', function(req, res){
  var ticket = req.url.replace('/retrieve/', '');
  db.Queue.fetchOne(Number(ticket), function(err, data){
    data = JSON.parse(JSON.stringify(data))
    delete data.__v;
    delete data._id;
    console.log(data)
    if(!data){
      res.status(200).json('No such ticket')
    } else if(data.success){
      db.Url.fetch(Number(ticket), function(err, data){
        data = JSON.parse(JSON.stringify(data));
        delete data.__v;
        delete data._id;
        res.status(200).json(data);
      })
    } else if(data.attempted){
      data.message = 'Retrieval failed. Please submit another ticket.';
      res.status(400).json(data);
    } else {
      data.message = 'URL not ready, please wait 5 minutes before checking again!';
      res.status(400).json(data);
    }
  });
})

app.post('/test', function(req, res){
  worker.fetchQueuedUrls();
  res.sendStatus(200)
})

//App is listening on port 3000
app.listen(3000, function(){
  console.log('Url Fetch Queue is listening on 3000!')
})

//Cron Job scheduled every 5 minutes
cron.schedule('*/5 * * * *', function(){
  worker.fetchQueuedUrls();
  console.log('Worker activated.');
});