const express = require('express');
const morgan = require('morgan');
const home = require('./routes/home');
const upload = require('./routes/upload');

// load express
app = express();

// set view engine
app.set('view engine', 'ejs');

// add middleware to the app
// use morgan for logging requests
app.use(morgan('tiny'));

// Routers
app.use('/', home);
app.use('/upload', upload);

// start listening for requests
const port = process.env.PORT || 3000;
app.listen(port, ()=>{console.log(`listening on port ${port}`)});