var AppProcess = (function (){
    var serverProcess;
    function _init(SDP_function, my_connid){
        serverProcess = SDP_function;
        my_connection_id = my_connid;
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

    function setConnection(connid){
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async function(event) {
            await setOffer(connid);
        }
        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(JSON.stringify({icecandidate: event.candidate}),connid)
            };
        }
    };

 /* stoped 2.39 */

    connection.ontrack = function(event){

    }
    
    return{
        setNewonnection: async function(connid) {
            await setConnection(connid);
        },
       init: async function (SDP_function, my_connid) {
         await _init(SDP_function,my_connid);
       },
    };
});

/*creating app and its functionalities*/

var MyApp = (function (){
    var socket = null;
    var user_id="";
    var meeting_id="";
    function  init(uid,mid) {
        user_id=uid;
        meeting_id = mid;
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
            if(socket.conneted){

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
        
        socket.on("inform_others_about_me",function(data){
            addUser(data.other_user_id, data.connId);
            AppProcess.setNewConnection(data.connId);
        })   
    }
    /*for cloneing the div to get more users*/
    function addUser(other_user_id,connId){
        var newDivId= $("#othertemplete").clone();
        newDivId=newDivId.attr("id",connid).addClass("other");
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