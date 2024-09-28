var AppProcess = (function (){
    /*Global variables*/
    var peers_connection_ids = [];
    var peers_connection = [];
    var remote_vid_stream = [];
    var remote_aud_stream = [];
    var local_div;
    var audio;
    var isAudioMute = true;
    var rtp_aud_senders= [];
    var rtp_vid_senders = [];
    var video_state = {
        None:0,
        Camara:1,
        ScreenShare:2
    }
    var video_st =video_state.None;
    var videoCamTrack;
     
    
    
/*stoped at 3.54 */
    /*for server functions*/

    var serverProcess;
    async function _init(SDP_function, my_connid){
        serverProcess = SDP_function;
        my_connection_id = my_connid;
        eventProcess();
        local_div = document.getElementById("localvideoplayer");
    }
    /*for mic operation */
    function eventProcess(){
        $("#micemuteunmute").on("click",async function () {
            if(!audio){
                await loadAudio();
            }
            if(!audio){
                alert("Audio is not grated");
                return;
            }
            if(isAudioMute){
                audio.enable =true;
                $(this).html("<span class='material-icons'>mic</span>");
                updateMediaSenders(audio,rtp_aud_senders);
            }else{
                audio.enable =false;
                $(this).html("<span class='material-icons'>mic-off</span>");
                removeMediaSenders(rtp_aud_senders);
            }
            isAudioMute = !isAudioMute;

        });
        $("#videoCamOnOff").on("click",async function(){

        if (video_st == video_state.Camara){
            await videoProcess(video_state.None)
        }else {
            videoProcess(video_state.Camara)
        }
        })
        $("#btnScreenShareOnOf").on("click",async function(){
            if (video_st == video_state.ScreenShare){
                await videoProcess(video_state.None)
            }else {
               await videoProcess(video_state.ScreenShare)
            }
        });
    }

    async function loadAudio() {
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video : false,
                audio: true
            });
            audio = stream.getAudioTrack()[0];
            audio.enable = false;
            console.log("Audio is loaded:",audio);
        }catch(e){
            console.log(e);
        }
    }

    function connection_status(connection){
        if (connection && (connection.connectionState == "new" || 
            connection.connectionState == "connecting" || 
            connection.connectionState == "connected")){
            return true;
        }else{
            return false;
        }
    }
    // to update the operations performed in others screen
    async function updateMediaSenders(track,rtp_vid_sender){

        for(var con_id in peers_connection_ids){
            if(connection_status(peers_connection[con_id])){
                if(rtp_senders[con_id] && rtp_senders[con_id].track){
                    rtp_senders[con_id].replaceTrack(track);
                }else{
                    rtp_senders[con_id] == peers_connection[con_id].addTrack(track);
                }
            }
        }
    }

    function removeVideoSenders(rtp_senders){
        for(var con_id in peers_connection_ids){
            if(rtp_senders[con_id] && connection_status(peers_connection[con_id])){
                peers_connection[con_id].removeTrack(rtpSenders[con_id]);
                rtp_senders[con_id] = null;
            }
        }
    }

    function removeVideoStream(rtp_vid_senders){
        if( videoCamTrack){
            videoCamTrack.stop();
            videoCamTrack = null;
            local_div.srcObject = null;
            removeVideoSenders(rtp_aud_senders);
        }
    }

    async function videoProcess(newVideoState){
        if(newVideoState == video_state.None){
            $("#videoCamOnOff").html("<span class='material-icons'>videocam_off</span>");
            
            video_st = newVideoState;
            removeVideoStream(rtp_vid_senders);
        }
        if(newVideoState == video_state.Camara){
            $("#videoCamOnOff").html("<span class='material-icons'>videocam_on</span>");
        }
        try{
            var vstream = null;
            if(newVideoState == video_state.Camara){
                vstream = await navigator.mediaDevices.getUserMedia({
                    video:{
                        width: 1920,
                        height: 1080
                    },
                    audio: false
                });
            }else if(newVideoState == video_state.ScreenShare){
                vstream = await navigator.mediaDevices.getDisplayMedia({
                    video:{
                        width: 1920,
                        height: 1080
                    },
                    audio: false
                });
            }
            if(vstream && vstream.getVideoTracks().length>0){
                videoCamTrack = vstream.getVideoTracks()[0];
                if(videoCamTrack){
                    local_div.srcObject = new MediaStream([videoCamTrack]);
                    updateMediaSenders(videoCamTrack,rtp_vid_senders);

                }
            }
        }catch(e){
            console.log(e);
            return;
        }
        video_st = newVideoState;


    }
    /*setnew connection function creation*/
    var iceConfiguration={
        iceServers:[
            {
                urls:"stun:stun.l.google.com:19302",
            },
            {
                urls:"stun:stun.l.google.com:19302",
            },
        ]
    }

    
    /* to set the connection btw the users*/

    async function setConnection(connid){
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async function(event) {
            await setOffer(connid);
        };
        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(
                    JSON.stringify({icecandidate: event.candidate}),connid);
            };
        };
        connection.ontrack = function(event){
            if(!remote_vid_stream[connid]){
                remote_vid_stream[connid] = new MediaStream();
            }
            if(!remote_aud_stream[connid]){
                remote_aud_stream[connid] = new MediaStream();
            }

            if (event.track.kind == "video"){
                remote_vid_stream[connid].getVideoTrack().forEach((t)=> remote_vid_stream[connid].removeTrack(t));
                remote_vid_stream[connid].addTrack(event.track);

                var remoteVideoPlayer = document.getElementById("v_"+connid);
                remoteVideoPlayer.srcObject = null;
                remoteVideoPlayer.srcObject = remote_vid_stream[connid];
                remoteVideoPlayer.load();
            }else if (event.track.kind == "audio"){
                remote_aud_stream[connid]
                .getAudioTrack()
                .forEach((t)=> remote_aud_stream[connid].removeTrack(t));
                remote_aud_stream[connid].addTrack(event.track);

                var remoteAudioPlayer = document.getElementById("a_"+connid);
                remoteAudioPlayer.srcObject = null;
                remoteAudioPlayer.srcObject = remote_aud_stream[connid];
                remoteAudioPlayer.load();
            }
        };

        peers_connection_ids[connid]=connid;
        peers_connection[connid] = connection;

        if(video_st == video_state.Camara || video_st == video_state.ScreenShare){
           if(videoCamTrack){
                updateMediaSenders(videoCamTrack,rtp_vid_sender)

           }

        }

        return connection;
    };


    /*for set offer connection !!!!!!!*/
    /* we used to send our data to other users in meeting*/

    async function setOffer(connid){
        var connection = peers_connection[connid];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(JSON.stringify({
            offer: connection.localDescription,
        }),connid)
    }

    async function SDPProcess(message,from_connid){
        message = JSON.parse(message);
        if(message.answer){
            await peers_connection[from_connid].setRemoteDescription(new 
                RTCSessionDescription(message.answer))

        }else if(message.offer){
            if(!peers_connection[from_connid]){
                await setConnection(from_connid);
            }
            await peers_connection[from_connid].setRemoteDescription(new 
            RTCSessionDescription(message.offer))
            var answer = await peers_connection[from_connid].createAnswer();
            await peers_connection[from_connid].setLocalDescription(answer);
            serverProcess(JSON.stringify({
               answer: answer,
            }),from_connid
        );
            
        }else if(message.icecandidate){
            if(!peers_connection[from_connid]){
                await setConnection[from_connid];
            }
            try{
                await peers_connection[from_connid].addIceCandidate(
                    message.icecandidate);
            }catch(e){
                console.log(e);
            }
        }   
    }

    async function closeConnection(connid){
        peers_connection_ids[connid]=null;
        if(peers_connection[connid]){
            peers_connection[connid].close();
            peers_connection[connid] = null;

        }
        if(remote_aud_stream[connid]){
            remote_aud_stream[connid].getTrack().forEach((t)=> {
                if(t.stop()) t.stop();
            }) 
            remote_aud_stream[connid] = null;
        }
        if(remote_vid_stream[connid]){
            remote_vid_stream[connid].getTrack().forEach((t)=> {
                if(t.stop()) t.stop();
            }) 
            remote_vid_stream[connid] = null;
        }
    }

    return{
        setNewConnection: async function(connid) {
            await setConnection(connid);
        },
       init: async function (SDP_function, my_connid) {
         await _init(SDP_function,my_connid);
       },
       processClientFunc: async function (data, from_connid) {
        await SDPProcess(data,from_connid);
      },
      closeConnectionCall: async function (connid) {
        await closeConnection(connid);
      },
    };
})();
    

    

/*creating app and its functionalities*/

var MyApp = (function (){
    var socket = null;
    var user_id="";
    var meeting_id="";
    function  init(uid,mid) {
        /* to specifie the self as me and other participants as others */
        user_id=uid;
        meeting_id = mid;
        $("#meetingContainer").show();
        $("#h2").text(user_id+"(Me)"); 
        document.title = user_id;
        event_process_for_signaling_sever();
    }
    /*handling the user's signal*/
    function event_process_for_signaling_sever(){
        socket = io.connect();

        /*creating the  acutual SDP function*/
        var SDP_function = function(data,to_connid){
            socket.emit("SDPProcess",{
                message:data,
                to_connid:to_connid
            });
        }
        socket.on("connect",() =>{
            if(socket.connected){

               /* getting the access for function from the AppProcess*/

               AppProcess.init(SDP_function,socket.id)

                if(user_id!=""){
                    socket.emit("userconnect",{
                        displayName:user_id,
                        meetingid:meeting_id
                    });
                }
            }
        });
        // for removed user.
        socket.on("inform_others_disconnected_user",function(data){
            $("#"+data.connId).remove();
            AppProcess.closeConnectionCall(data.connId);
        })
        
        socket.on("inform_others_about_me",function(data){
            addUser(data.other_user_id, data.connId);
            AppProcess.setNewConnection(data.connId);
        });
        socket.on("inform_me_about_other_user",function(other_user){
            if(other_user){
                for(var i = 0; i<other_user.length;i++){
                    addUser(other_user[i].user_id,
                    other_user[i].connectionId)
                    AppProcess.setNewConnection(other_user[i].connectionId);

                }
            }
            
        });
         socket.on("SDPProcess", async function (data) {
            await AppProcess.processClientFunc(data.message, data.from_connid);
         })
    }
    /*for cloneing the div to get more users*/
    function addUser(other_user_id,connId){
        var newDivId= $("#othertemplete").clone();
        newDivId=newDivId.attr("id",connId).addClass("other");
        newDivId.find("h2").text(other_user_id);
        newDivId.find("video").attr("id","v_"+connId);
        newDivId.find("audio").attr("id","a_"+connId);
        newDivId.show();
     
    }

    return{
        _init:function(uid,mid){
            init(uid,mid);
        },
    };
})();