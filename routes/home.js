const express = require('express');
const router = express.Router();

const awsWorker = require('../controllers/aws.controller.js');

// router.get('/', (req, res)=>{
//     res.render('index', {msg: message});
// });

// home page
router.get('/', awsWorker.download);

module.exports = router;