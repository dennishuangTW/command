const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = require('express').Router();
const gulp = require('./cmdModule');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const shortid = require('shortid')


//setting
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');   
app.io = io;
app.db = db;
server.listen(3000);


db.defaults({ command : [] })
  .write()

//sockect test
io.on('connection', function(socket) {
   console.log('A user connected');

   //Send a message when 
   setTimeout(function() {
      //Sending an object when emmiting an event
      socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
   }, 4000);

   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});


//Route
app.use('/gulp', gulp);
app.get('/',function(req,res){
	res.render('template',{
		title: '監聽',
		console_name : ''
	});
});



app.get('/update/:name',function(req,res){

   if(db.isEmpty('name',req.params.name)){
      db.get('command').push(
         {
            name : req.params.name,
            path : req.query.path,
            status : '0'
         }
      )
      .write();
   }
   else{
      db.get('command')
      .find({ name:  req.params.name})
      .assign(
         { 
            path : req.query.path
         }
      )
      .write()

   }
});



app.use(function(req, res){
   res.sendStatus(404);
});





db.isEmpty = function(colomn,value){
   let temp_obj = {};
   temp_obj[colomn] = value;
   return (db.get('command').find(temp_obj).value() === undefined);
}