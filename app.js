var subdomain = require('express-subdomain');
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const compositionsRoutes = require('./api/routes/compositions');
const usersRoutes = require('./api/routes/users');

// mongoose.connect(
//     'mongodb://bhawanishiv:'
//     + 'qSs1xtHY3DmeEsh8' +
//     '@lipikaar-shard-00-00-3x4f1.mongodb.net:27017,lipikaar-shard-00-01-3x4f1.mongodb.net:27017,lipikaar-shard-00-02-3x4f1.mongodb.net:27017/test?ssl=true&replicaSet=lipikaar-shard-0&authSource=admin&retryWrites=true',
//     {
//         useNewUrlParser: true
//     });


app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes which should handle requests
// app.use(subdomain('api', compositionsRoutes));
app.use(subdomain('api', usersRoutes));
app.use(subdomain('api', compositionsRoutes));
// app.use('/users', usersRoutes);

app.use((req, res, next) => {
    const error = new Error('not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});


module.exports = app;