const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const router = require('express').Router();
const gulp = require('./route/runGulp');
const CommandModel = require('./models/CommandModel');


//setting
app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');   
app.io = io;
server.listen(3000);




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
	res.redirect('/gulp/show_list')
});



app.get('/update/:name',function(req,res){
   name = req.params.name;
   path = req.query.path;
   update_obj = {
      name,
      path,
      status : '0'

   }
   CommandModel.update(update_obj);
});



app.use(function(req, res){
  res.redirect('/gulp/show_list')
});





