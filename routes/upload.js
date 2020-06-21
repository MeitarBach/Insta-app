let express = require('express');
let router = express.Router();
let upload = require('../config/multer.config.js');
 
const aws = require('../controllers/aws.controller.js');
 
router.post('/', upload.single("file"), aws.upload);
 
module.exports = router;