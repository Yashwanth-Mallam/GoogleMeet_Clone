// Import the 'http' module
const express = require('express');
const path = require("path");
var app = express();
var server = app.listen(5500,function(){
  console.log("sever Lisining at port 3000");
})

const io = require("socket.io")(server,{
  allowEIO3:true,
});
app.use(express.static(path.join(__dirname,"")));//frontend/index.html.(if u wanna connet it to the client side.).

// initiating the soceket.
io.on("connection",(socket)=>{
  console.log("socket id is",socket.id);});