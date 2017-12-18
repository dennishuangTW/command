var express = require('express');
var router = express.Router();
var child_process = require('child_process');
var iconv = require('iconv-lite');
//var encoding = 'cp950'; // command line encode
var encoding = 'utf8'; // command line encode
var binaryEncoding = 'binary';
var time = require('node-datetime');
var child_process_arr = [];
var command = 'gulp sass:watch';



router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/run/:name', function (req, res) {
	var name = req.params.name;
	let command_obj =  req.app.db.get('command')
	.find({ name:  req.params.name})
	.value();

 	if(typeof child_process_arr[name] === 'undefined') {
		child_process_arr[name] =  child_process.exec(command, {cwd : command_obj.path, encoding: binaryEncoding });
		req.app.db.get('command')
		.find({ name:  req.params.name})
		.assign({
			status : '1'
		})
		.write();

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
		  	

        	res.redirect('/gulp/stop/'+name);

		});



	}
	else{
		console.log('已經存在');
	}
})

router.get('/stop/:name', function (req, res) {
	var name = req.params.name;
  	var isWin = /^win/.test(process.platform);
	if(!isWin) {
	    kill(child_process_arr[name].pid);
	} else {
	    var kill = child_process.exec('taskkill /PID ' + child_process_arr[name].pid + ' /T /F');             
	}
	delete child_process_arr[name];
	req.app.db.get('command')
	.find({ name: name})
	.assign({
		status : '0'
	})
	.write();
    console.log('delete success');
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
	command_list = req.app.db.get('command').value();
	res.render('show_list',{
		data : command_list
	})
	
})



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

