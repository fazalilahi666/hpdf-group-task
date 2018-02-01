var express = require('express');
var app = express();
var request = require('request');
var router = express.Router();
var morgan = require('morgan');
var bodyParser = require('body-parser');
require('request-debug')(request);

var fbBotRouter = require('./fbBot');
var webhookRouter = require('./newsWebhook');

var server = require('http').Server(app);

router.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', webhookRouter);
app.use('/fb-bot', fbBotRouter);

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
