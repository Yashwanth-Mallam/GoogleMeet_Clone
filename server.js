

// Import the 'http' module


const express = require('express');
const path = require("path");
var app = express();
var server = app.listen(3000,function(){
  console.log("sever Lisining at port 3000");
})

// Serve static files from the current directory (including index.html)
app.use(express.static(path.join(__dirname)));

// Alternatively, serve index.html directly when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const io = require("socket.io")(server,{
  allowEIO3:true,
});



var userConnections=[];
// initiating the soceket.
//change the logic here 
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



    // we r creating the interface for both user's to seee each other
    


  other_user.forEach((v)=>{
    socket.to(v.connectionId).emit("inform_others_about_me",{
      other_user_id: data.displayName,
      connId: socket.id,
    });
  });  
  socket.emit("inform_me_about_other_user", other_user);

  });

    socket.on("SDPProcess",(data) => {
      socket.to(data.to_connid).emit("SDPProcess",{
        message: data.message,
        from_connid: socket.id,
      })
    });

    socket.on("disconnected",function(){
      console.log("User Disconnected");
      var disUser = userConnections.find((p) => p.connectionId == socket.id);
      if (disUser){
        var meetingid = disUser.meeting_id;
        userConnections = userConnections.filter(
          (p) => p.connectionId != socket.id
        );
        var list = userConnections.filter((p)=> p.meeting_id == meetingid);
        list.forEach((v) =>{
          socket.to(v.connectionId).emit("inform_others_disconnected_user",{
            connId: socket.id,
          });
        });
      }
    });

});


 

