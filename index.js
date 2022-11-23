const express = require('express');
const path = require("path");
const server = require('./config/server');
var cors = require('cors')

const PORT = server.port || 4040;
const app = express();

//app.use("/public", express.static(path.resolve(__dirname + '/public')));

var bodyParser = require('body-parser')

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(cors())
app.use("/api", require("./src/routes"));
app.listen(PORT,()=>{
  console.log('Server listening on port '+PORT);
  //require('./src/models')(app);

});
