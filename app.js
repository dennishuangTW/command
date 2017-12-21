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
app.locals.baseUrl = "192.168.3.36:3000";
app.locals.siteName = "Command Panel";

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
app.use('/', gulp);


app.use(function(req, res){
   console.log(req.app.locals.baseUrl);
  res.redirect('/show_list')
});





