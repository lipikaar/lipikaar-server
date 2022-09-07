const express = require('express');
const router = express.Router();

const my_sql = require('../../database');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //reject a file
    if (file.mimeType == 'image/jpeg' || file.mimeType == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('users/signUp', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({ message: 'email exists' })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json(
                            {
                                error: err
                            });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                            // userImage: req.file.path
                        });
                        user
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'user created sucessfully',
                                    createdUser: {
                                        userId: result._id,
                                        name: result.name,
                                        email: result.email,
                                        userImge: result.userImge,
                                        url: 'http://localhost:3000/users/' + result._id
                                    },
                                    signedIn: {
                                        token: jwt.sign({
                                            email: result.email,
                                            userId: result._id
                                        },
                                            process.env.JWT_KEY, {
                                                expiresIn: "1h",
                                            },
                                        )
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });

});

router.post('/users/signIn', (req, res, next) => {
    my_sql('SELECT * FROM `emails` WHERE `email`=?', [email], (err, rows) => {
        if (!err) {
            return res.status(200).json({ "rows": rows });
            // if (rows.length == 1) {
            // return res.status(200).json({
            //     message: 'auth successful',
            //     token: 'token'
            // })
            // }
        }
        return res.status(401).json({
            message: 'auth failed4'
        });

    });
    // User.find({ email: req.body.email })
    //     .exec()
    //     .then(user => {
    //         if (user.length < 1) {
    //             return res.status(401).json({
    //                 message: 'auth failed2'
    //             });
    //         }
    //         bcrypt.compare(req.body.password, user[0].password, (err, result) => {
    //             if (err) {
    //                 return res.status(401).json({
    //                     message: 'auth failed3'
    //                 });
    //             }
    //             if (result) {
    //                 const token = jwt.sign({
    //                     email: user[0],
    //                     userId: user[0]._id
    //                 },
    //                     process.env.JWT_KEY, {
    //                         expiresIn: "1h",
    //                     },
    //                 );
    //                 return res.status(200).json({
    //                     message: 'auth successful',
    //                     token: token
    //                 })
    //             }
    //             return res.status(401).json({
    //                 message: 'auth failed4'
    //             });
    //         });
    //     });
});

router.get('/users/', (req, res, next) => {
    res.json({ url: 'sds' })
    // User.find()
    //     .select('name email _id')
    //     .exec()
    //     .then(docs => {
    //         const response = {
    //             count: docs.length,
    //             users: docs.map(doc => {
    //                 return {
    //                     name: doc.name,
    //                     email: doc.email,
    //                     _id: doc._id,
    //                     request: {
    //                         type: 'GET',
    //                         url: 'http://localhost:3000/users/' + doc._id
    //                     }
    //                 }
    //             })
    //         };
    //         res.status(200).json(response);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ error: err });
    //     });
});

router.get('users/:userId', checkAuth, (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
        .select('name email _id')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    user: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/users/' + id
                    }
                });
            }
            else {
                res.status(404).json({ message: 'No valid entry found for the provided id' });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('users/:userId', checkAuth, (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    user.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json(
                {
                    message: 'user updated',
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/users/' + id
                    }
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.delete('users/:userId', (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'user deleted',
                request: {
                    type: 'DELETE',
                    url: 'http://localhost:3000/users' + req.params.userId,
                    data: {
                        name: 'String', email: 'String'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;