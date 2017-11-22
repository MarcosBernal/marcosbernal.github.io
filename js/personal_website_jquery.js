// When DOM has been loaded the function is triggered
$(document).ready(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  NAV_MENU - WELCOME  ////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $("#spanish_lang").on("click", function () {
        //$(".lang").css({background: "black"});
        //$(this).css({background: "gray"});
        //$(document).load("../index_es.html");
        alert("Desarrollando funcionalidad!! Por favor consúltalo de nuevo mas tarde!")
    });

    $("#english_lang").on("click", function () {
        $(".lang").css({background: "black"});
        $(this).css({background: "gray"});
        //$(document).load("../index_en.html");
    });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  CANVAS - GRAPH - TEXT  /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Set position and size to graph and divider initially in the middle
    $("#right_graph").offset({top:$("#left_text").offset().top});
    $("#right_graph").css({'width':Math.round($('#left_text').width()/2),
        'height':$('#left_text').height()});
    $("#divider").css({'right':($('#right_graph').width()+$('#divider').width()),
        'height':$('#left_text').height()});
    $("#divider").offset({top:$("#left_text").offset().top});

    $("#mynetwork").css({'width':$('#left_text').width(),
        'height':$('#left_text').height()});

    // Refreshing the position of the knowledge graph and text according the mouse position
    var divPos = {};
    var right_graph_pos = 0;
    var offset = $("#left_text").offset();

    $(".switching_content").on("mousemove", function(e){
    divPos = {
        left: e.pageX - offset.left,
        top: e.pageY - offset.top
    };
    });
    var interval = undefined;
    $("#divider").on("mousedown touchstart", function(e){
        if(interval == undefined){
            interval = setInterval(function() {
                divPos.left = divPos.left > 0 ? divPos.left : 0;
                divPos.left = divPos.left > $('#left_text').width()+ $('#divider').width() ?
                    $('#left_text').width()+$('#divider').width() : divPos.left;
                right_graph_pos = $('#left_text').width() - divPos.left;
                right_divider_pos = right_graph_pos == 0 ? 0 : right_graph_pos+$('#divider').width();
                $("#right_graph").css('width', right_graph_pos);
                $("#divider").css('right',right_divider_pos);
                $("p").css('user-select', "none");
                $("img").css('user-select', "none");

                if(right_graph_pos <= 0)
                    $("#text_button").css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"});
                else if(right_graph_pos == $("#left_text").width())
                    $("#graph_button").css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"});
                else{
                    $("#text_button").css({background: "", border: ""});
                    $("#graph_button").css({background: "", border: ""});
                }
            }, 10);
        }
    });
    $("#divider").on("mouseup touchend", function(){
        clearInterval(interval);
        interval = undefined;
        $("p").css('user-select', "auto");
        $("img").css('user-select', "auto");
    });

    //Show completely all introduction either text or graph
    $("#text_button").on("click touch", function(){
        clearInterval(interval);
        interval = undefined;

        if ($("#right_graph").width() == 0){
            $("#right_graph").css({'width':Math.round($('#left_text').width()/2)});
            $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
            $(this).css({background:"", border:""});
        }
        else {
            $("#right_graph").css('width', 0);
            $("#divider").css('right', $("#right_graph").width());
            $(this).css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"});
            $("#graph_button").css({background:"", border:""});
        }
    });

    $("#graph_button").on("click touch", function(e){
        clearInterval(interval);
        interval = undefined;
        if ($("#right_graph").width() == $("#left_text").width()){
            $("#right_graph").css({'width':Math.round($('#left_text').width()/2)});
            $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
            $(this).css({background:"", border:""});
        }
        else {
            $("#right_graph").css('width',$("#left_text").width());
            $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
            $(this).css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"});
            $("#text_button").css({background:"", border:""});
        }
    });



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  CONTACT - JS SERVER   //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connection = new WebSocket('wss://inbox-website.marcosbernal.es/websocket');

    connection.onopen = function () {
        // connection is opened and ready to use
        console.log("Connected with server");

        //This is How to use the Waitable findIP function, and react to the
        //results arriving
        var ipWaitObject = findIP(foundNewIP);        // Puts found IP(s) in window.ipAddress
        ipWaitObject.then(
            function (result) { console.log("IP(s) Found.  Result: '" + result + "'. You can use them now: " + window.ipAddress); },
            function (err) { console.log("IP(s) NOT Found.  FAILED!  " + err); }
        );
    };

    connection.onclose = function () {
        $(".block_comm").css({display:'block',width:Math.round($("#contact_form").width()), height:Math.round($("#contact_form").height()-$("#message_button").height()), 'margin-top': Math.round($("#Contact h4").height())});
        $("#message_button").text("Not available. Please come later!!");
    }

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
        console.log("Error on connection");
        $(".block_comm").css({display:'block',width:Math.round($("#contact_form").width()), height:Math.round($("#contact_form").height()-$("#message_button").height()), 'margin-top': Math.round($("#Contact h4").height())});
        $("#message_button").toggleClass('error_com');
        $("#message_button").text("Not available. Please come later!!");
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message
        // from server is json)
        console.log("Received message from server " + message.toString());
        try {
            var json = JSON.parse(message.data);
        } catch (e) { console.log('>> Error answer doesn\'t look like a valid JSON: ', message.data); return false; }

        if(json['type'] == 'Reply' && json['message'] == "Message Processed"){
            $("textarea[name~='message']").val('Thank you, '+$("input[name~='firstname']").val() + '\n\nI will reply you in less than 48 hours. \nNevertheless, if you need urgent contact, please use linkedin. \n\nRegards, Marcos');
            $("input[name~='firstname']").val('');
            $("input[name~='phone']").val('');
            $("input[name~='email']").val('');
            $("input[name~='subject']").val('');

            console.log('>> Confirmation of reception:',message);
            $("#message_button").text('Message was properly sent!!');
            $("#message_button").toggleClass("message_conf");
        }else {
            $("#contact_form").toggleClass("conn_error");
            $("#message_button").toggleClass("conn_error");
            console.log(">> Error when receiving confirmation. Message", message);
        }
        // handle incoming message
    };

    $("#contact_form").submit(function() {
        if($("#message_button").text().indexOf("No") == 0) {
            console.log("Tried to connect without socket");
            return false;
        }

        if($("#message_button").hasClass('message_conf')){
            console.log("Message already sent.");
            return false;
        }

        var message = {
            type: "message",
            date: Date(),
            privOrigin: window.ipAddress,
            firstname: $("input[name~='firstname']").val().toString(),
            phone: $("input[name~='phone']").val().toString(),
            email: $("input[name~='email']").val().toString(),
            subject: $("input[name~='subject']").val().toString(),
            message: $("textarea[name~='message']").val().toString()
        }

        console.log('tried');

        // Check if form are properly written
        $('.mandatory_form').each(function() {
            if($(this).val().toString() == '')
              $(this).addClass('blame_form');
            else
              $(this).removeClass('blame_form');
        });

        if($('.blame_form').length == 0) //Only send a message when the form is complete
          connection.send(JSON.stringify(message));
        else
          $("#message_button").text("Please review, before sending again!");



        return false; // NEED RETURN FALSE to not refresh page and keep values in the form

    });
});




// Funtion to obtain the IP in the client browser without any server interaction
// Code from BRebey https://stackoverflow.com/a/36610819
function findIP(onNewIP) { //  onNewIp - your listener function for new IPs
    var promise = new Promise(function (resolve, reject) {
        try {
            var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
            var pc = new myPeerConnection({ iceServers: [] }),
                noop = function () { },
                localIPs = {},
                ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                key;
            function ipIterate(ip) {
                if (!localIPs[ip]) onNewIP(ip);
                localIPs[ip] = true;
            }
            pc.createDataChannel(""); //create a bogus data channel
            pc.createOffer(function (sdp) {
                sdp.sdp.split('\n').forEach(function (line) {
                    if (line.indexOf('candidate') < 0) return;
                    line.match(ipRegex).forEach(ipIterate);
                });
                pc.setLocalDescription(sdp, noop, noop);
            }, noop); // create offer and set local description

            pc.onicecandidate = function (ice) { //listen for candidate events
                if (ice && ice.candidate && ice.candidate.candidate && ice.candidate.candidate.match(ipRegex)) {
                    ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
                }
                resolve("FindIPsDone");
                return;
            };
        }
        catch (ex) {
            console.log(Error(ex));
        }
    });// New Promise(...{ ... });
    return promise;
};

//This is the callback that gets run for each IP address found
function foundNewIP(ip) {
    if (typeof window.ipAddress === 'undefined'){ window.ipAddress = ip; }
    else{ window.ipAddress += " - " + ip; }
}
