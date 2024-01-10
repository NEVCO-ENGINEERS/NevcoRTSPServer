'use strict';
var express = require('express');
const http = require('http');
const https = require('https');
require('events').EventEmitter.defaultMaxListeners = 15;
const corsOpts = {
    origin: '*',
    optionsSuccessStatus: 200, // For legacy browser support
    methods: [
        'GET',
        'POST',
    ],
    allowedHeaders: [
        'Content-Type',
    ],
};


const cors = require('cors');
const config = require('./config');
const { decode } = require('querystring');
const { https: { key, cert }, port, isHttps, serviceName } = config;
const credentials = { key, cert };

const app = express();
app.use(cors(corsOpts));

const { proxy, scriptUrl } = require('rtsp-relay')(app);

//const handler = proxy({
//    url: `rtsp://admin:1998Samyak@10.100.112.7`,
//    // if your RTSP stream need credentials, include them in the URL as above
//    verbose: false,
//});
//app.ws('/api/stream', handler);

// the endpoint our RTSP uses
app.ws('/api/stream/:cameraIP', (ws, req) => {    
    const plain = new Buffer.from(req.params.cameraIP, 'base64').toString('utf8')  
    proxy({
        url: `rtsp://${plain}`,
    })(ws)
});

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.error = err;
    const status = err.status || 500;
    res.status(status);
});

app.listen(port);
module.exports = { app };



