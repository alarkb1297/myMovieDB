var mysql = require('mysql');
var express = require('express');
var app = express();

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Alark212',
    database: 'starwarsFINAL'
});

connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected with mysql database...')
});

connection.query("select * from characters", function (err, result) {
    if (err) throw err;
    console.log(result);
});

module.exports = connection;