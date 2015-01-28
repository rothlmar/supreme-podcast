#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var request = require('request');

var app = express()

var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var PORT      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.get('/', function(req,res) {
    request('http://www.supremecourt.gov/oral_arguments/argument_audio.aspx').pipe(res);
});

app.listen(PORT, IPADDRESS, function() {
    console.log("starting up...");
})
