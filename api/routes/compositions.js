const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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


const Composition = require('../models/compositions');
const User = require('../models/users');

router.get('/', (req, res, next) => {
    Composition.find()
        .select('title content author _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                compositions: docs.map(doc => {
                    return {
                        title: doc.title,
                        _id: doc._id,
                        content: doc.content,
                        author: doc.author,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/compositions/' + doc._id
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

router.post('/', checkAuth, upload.single('compositionImage'), (req, res, next) => {
    User.findById(req.body.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json(
                    {
                        message: 'user not found'
                    });
            }
            const composition = new Composition({
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                content: req.body.content,
                userId: req.body.userId
                // compositionImage:req.file.path
            });
            return composition.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'composition added successfully',
                cratedComposition: {
                    _id: result._id,
                    title: result.title,
                    content: result.content,
                    compositionImage:result.compositionImage,             
                    author: result.author,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/compositions/' + result._id
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

router.get('/:compositionId', (req, res, next) => {
    const id = req.params.compositionId;
    Composition.findById(id)
        .select('title content userId _id')
        .exec()
        .then(doc => {
            console.log('From database', doc);
            if (doc) {
                res.status(200).json({
                    composition: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/compositions/' + id
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

router.patch('/:compositionId', (req, res, next) => {
    const id = req.params.compositionId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Composition.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json(
                {
                    message: 'Composition updated sucessfully',
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/compositions/' + id
                    }
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
router.delete('/:compositionId', (req, res, next) => {
    const id = req.params.compositionId;
    Composition.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Composition deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/compositions',
                    data: {
                        title: 'String', content: 'String', author: 'uId'
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