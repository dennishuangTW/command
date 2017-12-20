const express = require('express');
const router = express.Router();
const child_process = require('child_process');
const iconv = require('iconv-lite');
//const encoding = 'cp950'; // command line encode
const encoding = 'utf8'; // command line encode
const binaryEncoding = 'binary';
const time = require('node-datetime');
const child_process_arr = [];
const command = 'gulp sass:watch';
const CommandModel = require('../models/CommandModel');



router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/run/:name', function (req, res, next) {
	var name = req.params.name;
	command_obj = CommandModel.getValueByName(name);

 	if(typeof child_process_arr[name] === 'undefined') {
		child_process_arr[name] =  child_process.exec(command, {cwd : command_obj.path, encoding: binaryEncoding });
		CommandModel.update({
			name,
			status : '1'
		});

		child_process_arr[name].stdout.on('data', function(data) {
			data = iconv.decode(new Buffer(data, binaryEncoding), encoding);
		   	req.app.io.emit('news_messages_'+name,
		   	{
		   		'console_name': name,
		   		'messages' : data
		   	});
		   	console.log(data);
		});

	 	child_process_arr[name].stderr.on('data', function (data) {
            data = iconv.decode(new Buffer(data, binaryEncoding), encoding);
		   	req.app.io.emit('news_messages_'+name,
		   	{
		   		'console_name': name,
		   		'messages' : data
		   	});
        }); 

        child_process_arr[name].on('error', function(err) {
		  	CommandModel.update({
				name,
				status : '0'
			});
			delete child_process_arr[name];
			
		});



	}
	else{
		console.log('已經存在');
	}
	res.redirect('/gulp/show_list');
})

router.get('/stop/:name', function (req, res, next) {
	var name = req.params.name;
  	var isWin = /^win/.test(process.platform);

  	if(child_process_arr[name] && child_process_arr[name].pid){		
  		if(!isWin) {
		    kill(child_process_arr[name].pid);
		} else {
		    var kill = child_process.exec('taskkill /PID ' + child_process_arr[name].pid + ' /T /F');             
		}
  	}
  	if(child_process_arr[name]){
		delete child_process_arr[name];
  	}
	CommandModel.update({
		name,
		status : '0'
	});
    console.log('delete success');
	res.redirect('/gulp/show_list');

})


router.get('/monitor/:name', function (req, res) {
	var name = req.params.name;
	var path = req.query.path;

	res.render('template',{
		title: '監聽',
		console_name : name
	});

})



// define the about route
router.get('/show_list', function (req, res) {
	command_list = CommandModel.getList();
	res.render('show_list',{
		data : command_list
	})
	
})

router.get('/delete/:name', function (req, res) {
	let name = req.params.name.trim();
	CommandModel.deleteByName(name);
	res.redirect('/gulp/show_list'); 	
})



router.get('/update/:name',function(req,res){
	res.render('update_command_view',{
		
	});
   name = req.params.name;
   path = req.query.path;
   update_obj = {
      name,
      path,
      status : '0'

   }
   CommandModel.update(update_obj);
});



var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};


// middleware that is specific to this router


module.exports = router;

