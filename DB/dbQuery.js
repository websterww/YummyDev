var mysql   =    require('mysql');
/**
 * node-mysql
 * https://github.com/felixge/node-mysql
 * @type {*}
 */
var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sarah',
  database: 'yummy'
});

exports.getFoods = function(req, res){
    var foods = {};
    pool.getConnection(function(err, conn){
        conn.query('select * from Food', function(error, rows, fields){
            for(i=0;i<rows.length;i++){


            }
            conn.end();
        });
    });
};