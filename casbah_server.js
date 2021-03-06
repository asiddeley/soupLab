const express = require('express')
const fs = require('fs')
const url = require('url')
const path = require('path')
const sqlite=require('sqlite3').verbose()
const bodyParser=require("body-parser") 
const casql=require(__dirname+"/zdatabase/casql.js")
const fileUpload = require('express-fileupload');


const app = express()

//Open database
const dbdir = __dirname + '/zdatabase';
const dbpath=dbdir+"/casbah.db"
try {fs.mkdirSync(dbdir, 0744); console.log("Database folder created.");}
catch(er){console.log("Database folder exists.")}
const db=new sqlite.Database(dbpath)


process.on("exit", function(){db.close();console.log("Database closed.");})
var sqlcount=1

//Main entry
app.get('/', function (req, res) {res.sendFile(path.join(__dirname + "/views/casbah.html"));})

//app.get('/jquery', function (req, res) {res.sendFile(require.resolve("/jquery"));})

//Static file server.  Use '../' to get parent path
app.use(express.static(path.join(__dirname)));

//resolve for jquery, bootstrap etc
/****
app.use(function(req, res, next){
	var dir;
	try{dir=require.resolve(req.url.replace("/",""));}
	catch(err) {console.log("File not found", req.url.replace("/",""));}
	console.log("REQ:", req.url.replace("/",""));
	console.log("Resolved filename:", dir);
	if (typeof dir!="undefined"){res.sendFile(dir)} else {next();}
});
*/

//Static files in node_modules.  Todo move Jquery, Bootstrap, caman etc to node_modules
//var pathToModule = require.resolve('module');
//app.use(function(req, res, next){next()})


//Logger
app.use(function(req, res, next){console.log("LOG...",req.url);	next();});

//Database form handler and required middleware parsers
app.use( bodyParser.urlencoded({extended: true}));
app.use( bodyParser.json());

app.post('/database', function (req, res) {

	const rows=[]	
	sqlcount+=1	
	let msg="SQL#"+sqlcount.toString()
	const sql=req.body.SQL
	//console.log("SQLs to process...", sqls.length)
	
	//console.log("SQLs...", sqls);
	try {
		db.serialize( function () {
			db.all(sql_params(sql,	req.body), function(err, rows){
				var stat=(err==null)?" - db all ok":"db run error - "+err
				console.log(msg + stat)
				res.json({msg:msg+stat, rows:rows})
			})		
		})
	} 
	catch(err) {console.log("SQLITE ERROR...", err)}

})



/////////////////////////// 
// File Upload
app.use(fileUpload());
app.post('/upload', function(req, res) {
	console.log("Uploading files:", JSON.stringify(req.files)); // the uploaded file object
	if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
	// The name of the input field (i.e. "uploadee") is used to retrieve the uploaded file
	let uploadee = req.files.uploadee;
 
	// Use the mv() method to place the file somewhere on your server
	uploadee.mv("/upload/"+uploadee.name, function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});


//start serving
app.listen(8080, function () {console.log('CASBAR server listening on port 8080!')});


//prepare SQL by substituting parameters with corresponding values
function sql_params(sql, params){
	/**************
	Returns a sql string based on sql with key:value substitutions from params {} 
	
	Why is this function required when db.run has it built in db.run(sql, params, callback) ?
	Because if params have more elements than the sql has placeholders it throws an error
	This function is more forgiving
	*************/
	
	//console.log("sql_params...")
	//ensure these aren't touching terms
	sql=sql.replace(/\(/g, " ( ") 
	sql=sql.replace(/\)/g, " ) ") 
	sql=sql.replace(/=/g, " = ") 
	sql=sql.replace(/,/g , " , ") 
	//console.log("sql after grooming...", sql)
	var terms=sql.split(" ") 
	for (var i in terms){
		
		//term starts with '$' so a parameter, substitute it with it's corresponding vlaue
		if ( terms[i].indexOf("$")==0 ) {
			//console.log("term before...", terms[i].substring(1))
			terms[i]='"'+params[terms[i].substring(1)]+'"'
			//console.log("term after...", terms[i])
		}		
	}
	return terms.join(" ") //unsplit
}

