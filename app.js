var express = require('express'),
  app = express();

app.set('env', 'development');
require('./config.js')(app);
require('./server/errorCodes')(app);

app.publicFolder = __dirname + '/public';
app.publicUrl = app.get('publicUrl');
app.port = app.get('port');
app.host = app.get('hostName');
app.appName = app.get('appName');

app.use(express.bodyParser());
app.use(app.publicUrl, express.static(app.publicFolder));

var serverApi = require('./server/serverApi')(app);

app.post('/uploadFile', serverApi.uploadFile);
app.post('/uploadImage', serverApi.uploadImage);

app.listen(app.port);

console.log(app.appName   + ' started on ' + app.port + ' port');