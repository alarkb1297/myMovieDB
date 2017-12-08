var mysql = require('mysql');

// Initialize the connection parameters
var dbCon = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'movieDB'
});

// Connect to the database
exports.connect = function () {
  dbCon.connect(function(err){
    if(!err) {
      console.log("Database is connected.");
    } else {
      console.log("Error connecting database");
    }
  });
}

module.exports.db = dbCon;