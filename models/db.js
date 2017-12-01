var mysql = require('mysql');

var dbCon = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Alark212',
  database : 'movieDB'
});

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