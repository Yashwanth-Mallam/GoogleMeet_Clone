

// Import the 'http' module


const express = require('express');
const path = require("path");
var app = express();
var server = app.listen(3000,function(){
  console.log("sever Lisining at port 3000");
})



const io = require("socket.io")(server,{
  allowEIO3:true,
});
app.use(express.static(path.join(__dirname,"")));//frontend/index.html.(if u wanna connet it to the client side.).



var userConnections=[];
// initiating the soceket.
io.on("connection",(socket)=>{
  console.log("socket id is",socket.id);
  socket.on("userconnect",(data) =>{
    console.log("userconnect",data.displayName,data.meetingid);
    var other_user =userConnections.filter((p)=>p.meeting_id == data.meetingid);
    userConnections.push({
      connectionId:socket.id,
      user_id: data.displayName,
      meeting_id: data.meetingid,
    });



    /* we r creating the interface for both user's to seee each other*/
    


  other_user.forEach((v)=>{
    socket.to(v.connectionId).emit("inform_others_about_me",{
      other_user_id: data.displayName,
      connId: socket.id,
    })
  })    

  });
});


