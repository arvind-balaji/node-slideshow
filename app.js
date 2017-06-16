var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var cpr = require('cpr');
var mime = require('mime');
var routes = require('./routes/index');
var config = require('./routes/config');
var users = require('./routes/users');
var storage =   multer.diskStorage({
	destination: function (req, file, callback) {
	callback(null, 'public/images');
	},
	filename: function (req, file, callback) {
    //callback(null, file.fieldname + '-' + Date.now());
	callback(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype));
	}
});
var upload = multer({ storage : storage}).single('userPhoto');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/config', config)
//app.use('/users', users);


var contentDir = 'public/images';
var userDir;
var file;
var settings;

settings = JSON.parse(fs.readFileSync('public/settings.json', 'utf8'));
userDir = settings.userDir;

//move files from userDir to web accessible directory
function moveUserFiles() {
	cpr(userDir.toString(), "/Users/ArvindB/Documents/node-slideshow/public/images/", {
	    overwrite: true, //If the file exists, overwrite it
	    confirm: true //After the copy, stat all the copied files to make sure they are there
	}, function(err, files) {
		return console.error(err);
	});
}
moveUserFiles();

//call readImages() when a file change is detected
fs.watch(contentDir, {
	encoding: 'buffer'
}, (event, filename) => {
	if (filename)
		console.log('File change detected. Indexing ' + contentDir);
	readImages();
});

fs.watchFile('public/settings.json', {
	encoding: 'buffer'
}, (event, filename) => {
	if (filename)
		console.log('settings.json updated.');
	settings = JSON.parse(fs.readFileSync('public/settings.json', 'utf8'));
    moveUserFiles();
});

//create list of files from directory
function readImages() {
	fs.readdir(contentDir, function (err, files) {
		if (err)
			throw err;
		for (var index in files) {
			console.log(files[index]);
			file = files;
		}
	});
}
readImages();

//send list of images to client
app.post('/', function (req, res) {
	res.send(file);
});

//write settings recieved from client to settings.json
app.post('/api/saveSettings', function (req, res) {
	console.log(req.body);
    fs.writeFile('public/settings.json', JSON.stringify(req.body, null, 4), 'utf8');
	res.status(200).end();
});

//parse and send settings.json to client
app.post('/api/getSettings', function (req, res) {
	//console.log(req.body);
	//console.log(settings);
	res.send(settings);
	res.status(200).end();
});

//handle file uploads
app.post('/api/photo', function (req, res) {
	upload(req, res, function (err) {
		if (err) {
			return res.end('Error uploading file.');
		}
		res.status(204).end();
	});
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
