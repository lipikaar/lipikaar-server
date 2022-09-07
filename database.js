const mysql = require('mysql');

var sqlConnection = function sqlConnection(sql, values, next) {
    if (arguments.length === 2) {
        next = values;
        values = null;
    }

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'lipikaar',
        charset: 'utf8mb4_unicode_ci'
    });
    connection.connect((err) => {
        if (err) throw err;
        console.log('Connected!');
    });

    connection.query(sql, values, function (err) {
        connection.end();
        if (err) throw err;
        next.apply(this, arguments);
    });
}
module.exports = sqlConnection;