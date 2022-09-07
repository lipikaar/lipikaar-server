const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/users');

router.get('/', (req, res, next) => {
    User.find()
        .select('name email _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        name: doc.name,
                        email: doc.email,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/users/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post('/', (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email
    });
    user.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Handling POST request to /users',
                crateduser: {
                    name: result.name,
                    email: result.email,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/users/' + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:uId', (req, res, next) => {
    const id = req.params.uId;
    User.findById(id)
        .select('name email _id')
        .exec()
        .then(doc => {
            console.log('From database', doc);
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

router.patch('/:cId', (req, res, next) => {
    const id = req.params.cId;
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
router.delete('/:cId', (req, res, next) => {
    const id = req.params.cId;
    user.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'user deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/users',
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