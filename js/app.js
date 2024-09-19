var MyApp = (function (){
    function  init(uid,mid) {
        event_process_for_signaling_sever();
    }
    var socket = null;
    function event_process_for_signaling_sever(){
        socket = io.connect();
        socket.on("connect",()=>{
            alert("socket connectted to client side");
        });
        
    }
    return{
        _init:function(uid,mid){
            init(uid,mid);
        },
    };
})();