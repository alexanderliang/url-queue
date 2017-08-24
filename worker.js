var axios = require('axios');
var db = require('./database.js');

var Worker = {
  fetchQueuedUrls : function(){
    db.Queue.fetchNew(function(err, data){
      if(data){
        data.forEach(datum=>{
          console.log(datum.url)
          axios.get(datum.url)
          .then(function(response){
            console.log(response.headers['content-type'])
            urlObject = {
              id: datum.id,
              url: datum.url,
              timeUpdated: new Date(),
              data: response.data,
              type: response.headers['content-type']
            }
            db.Url.insert(urlObject)
          })
          .catch(function(err){
            db.Queue.update({
              id: datum.id,
              url: datum.url,
              date: new Date,
              attempted: true,
              success: false,
            })
          })
        })
      }
    })
  }
}


module.exports = Worker;