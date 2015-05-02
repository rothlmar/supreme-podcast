#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var RSS = require('rss');


var app = express()

var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var PORT      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.get('/', function(req,res) {

    request({
	url: 'http://www.supremecourt.gov/oral_arguments/argument_audio.aspx',
	headers: {
	    'User-Agent': 'request'
	}
    }, function(err, resp, body) { 
	var $ = cheerio.load(body);
	var tbl = $('.datatables');
	var data = [];
	tbl.find('a').each(function(idx, elt) { 
	    // console.log(idx);
	    var argument = {
		href: elt.attribs.href,
		id: elt.children[0].data,
		title: elt.next.next.children[0].data,
		datestr: elt.parent.next.next.children[0].data,
		date: moment(elt.parent.next.next.children[0].data, "MM/DD/YY")
	    }
	    argument.enclosure = 'http://www.supremecourt.gov/media/audio/mp3files/';
	    argument.enclosure += path.parse(argument.href).name;
	    argument.enclosure += '.mp3';
	    // console.log(argument.enclosure);
	    data.push(argument);
	});
	data.sort(function(a,b) {
	    return b.date.valueOf() - a.date.valueOf();
	});

	var feed = new RSS({
	    title: 'Supreme Court Oral Arguments',
	    site_url: 'http://supreme-votech.rhcloud.com',
	    description: 'Supreme Court oral arguments are posted on http://www.supremecourt.gov.  This feed aggregates the recordings of those arguments in an RSS feed suitable for use in your favorite podcasting app or RSS reader.',
	    webMaster: 'Mark Rothlisberger',
	    feed_url: 'http://supreme-votech.rhcloud.com'
	});
	
	data.forEach(function(podcast) {
	    feed.item({
		title: podcast.title,
		url: podcast.href,
		date: podcast.date,
		description: podcast.title,
		enclosure: {url: podcast.enclosure}
	    });
	});
	res.send(feed.xml());
    }); 
});

app.listen(PORT, IPADDRESS, function() {
    console.log("starting up...");
})
