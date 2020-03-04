const config = require('config');
var mongoose = require('mongoose');

mongoose.connect(config.get('connections.db'), {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true , useFindAndModify:false});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Database connected successfully");
});

module.exports = db;