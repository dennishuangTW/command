const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const command_table = db.get('command');

exports.update = function(update_obj) {

  	if(db.isEmpty('name',update_obj.name)){
      	command_table.push(update_obj)
      	.write();
   	}
   	else{
      	command_table.find({ name : update_obj.name })
      	.assign(update_obj)
      	.write();
   	}
}

exports.getValueByName = function(name){
	return	command_table.find({ name }).value();
}

exports.getList = function(){
	return	command_table.value();
}

exports.deleteByName = function(name){
   command_table
   .remove({ name })
   .write();
}

exports.isEmptyByName = function(name){
	console.log(name);
   return db.isEmpty('name',name);
}




db.isEmpty = function(colomn,value){
   let temp_obj = {};
   temp_obj[colomn] = value;
   return (db.get('command').find(temp_obj).value() === undefined);
}