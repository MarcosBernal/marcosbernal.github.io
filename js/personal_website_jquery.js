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
    var connection = new WebSocket('ws://83.43.15.217:5001');

    connection.onopen = function () {
        // connection is opened and ready to use
        alert("Connected with server");

    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
        alert("Error on connection");
        $("#contact_form").toogle("conn_error");
        $("#message_button").toogle("conn_error");
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message
        // from server is json)
        alert("Received message from server " + message.toString());
        try {
            var json = JSON.parse(message.data);
        } catch (e) { alert.log('Server answer doesn\'t look like a valid JSON: ', message.data); return false; }

        if(json['message'] = "Processed"){
            $("input[name~='firstname']").val('');
            $("input[name~='phone']").val('');
            $("input[name~='email']").val('');
            $("input[name~='subject']").val('');
            $("textarea[name~='message']").val('');
            connection.close();
        }else {
            $("#contact_form").toogle("conn_error");
            $("#message_button").toogle("conn_error");
        }
        // handle incoming message
    };

    $("#contact_form").submit(function() {
        var message = {
            type: "message",
            date: Date.now(),
            firstname: $("input[name~='firstname']").val().toString(),
            phone: $("input[name~='phone']").val().toString(),
            email: $("input[name~='email']").val().toString(),
            subject: $("input[name~='subject']").val().toString(),
            message: $("textarea[name~='message']").val().toString()
        }

        connection.send(JSON.stringify(message));
        return false; // NEED RETURN FALSE to not refresh page and keep values in the form

    });

});
