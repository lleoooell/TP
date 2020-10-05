	var Twitter = require('twitter');


	var client = new Twitter({
	    consumer_key: '9w0egSCL10mSPsHtnV0US9W14',
	    consumer_secret: 'Y7gWwbZe6GJNCkmmNl7XsV40O17wSxjXEQynGAGCPLyqRuHwuq',
	    access_token_key: '2831463041-ZvyP3DpnhrAMW4Ts50s9Gyc1sTPH5sfvj0DjEwu',
	    access_token_secret: 'sesiZhTqSyschpoj0tC0L9WiLZxtcids27QGNqQ7vKsfH'
	});

	var express = require('express');
	var app = require('express')();
	var http = require('http').createServer(app);
	var io = require('socket.io')(http);
	var path = require('path');
	var Sensor = require('./models/sensors.js');



	const mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost:27017/capteurs', {
	    useNewUrlParser: true,
	    useUnifiedTopology: true
	});

	// viewed at http://localhost:8080
	app.get('/', function(req, res) {
	    res.sendFile(path.join(__dirname + '/client/index.html'));
	});
	app.get('/dataviz', function(req, res) {
	    res.sendFile(path.join(__dirname + '/client/dataviz.html'));
	});

	app.get('/api/capteurs/:stype', function(req, res) {


	    Sensor.find({"sensor_type" : req.params.stype}).exec(function(err, sensorList) {
	        if (err) {
	            console.log(err);
	        }
	        console.log(sensorList);
	        res.json(sensorList);

	    });


	});


	var stream = client.stream('statuses/filter', {
	    track: 'botGen'
	});
	stream.on('data', function(event) {

	    console.log(event);
	    if (event.user.id_str == '3341047145') {
	        console.log('mon compte twitter');
	        console.log(event.place.bounding_box.coordinates);
	        console.log(event.entities.hashtags);
	        if (event.entities.hashtags.length > 0) {
	            event.entities.hashtags.forEach(function(hash) {
	                if (hash.text === 'color') {
	                    var str = event.text.split(" ");
	                    str.forEach(function(word) {
	                        if (word.charAt(0) !== '#') {
	                            io.emit('colorChange', {
	                                'newcolor': word
	                            });

	                        }
	                    })
	                }
	                if (hash.text === 'temp') {
	                    var str = event.text.split(" ");
	                    str.forEach(function(word) {
	                        if (word.charAt(0) !== '#') {

	                            var newObj = {
	                                name: "Température Sensor",
	                                sensor_type: 'Temp',
	                                value: word,
	                            }
	                            const toCreate = new Sensor(newObj);

	                            toCreate.save().then(function(newValue) {
	                                io.emit('tempChange', {
	                                    'newTemp': word
	                                });

	                                console.log(newValue);


	                            });

	                        }
	                    })
	                }
	                if (hash.text === 'hum') {
	                    var str = event.text.split(" ");
	                    str.forEach(function(word) {
	                        if (word.charAt(0) !== '#') {
	                            var newObj = {
	                                name: "Humidity Sensor",
	                                sensor_type: 'Hum',
	                                value: word,
	                            }
	                            const toCreate = new Sensor(newObj);

	                            toCreate.save().then(function(newValue) {
	                                io.emit('humChange', {
	                                    'newHum': word
	                                });

	                                console.log(newValue);


	                            });

	                        }
	                    })
	                }
	            })
	        }
	    }

	});

	stream.on('error', function(error) {
	    throw error;
	});

	io.on('connection', (socket) => {
	    console.log('a user connected');
	});



	http.listen(3000, () => {
	    console.log('listening on *:3000');
	});