const mongoose = require('mongoose');


const Sensor = mongoose.model('Sensor', {
    name: String,
    sensor_type: String,
    value : Number,
    timestamp : {type : Date, default : Date.now}
});


module.exports = Sensor;


