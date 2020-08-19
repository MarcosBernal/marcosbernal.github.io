// Load the proper website according to the language selected (by default english)
var language = getCookie("language", "en");
let cookiesAccepted = getCookie("cookies", false);
let session = getCookie("session", { "first_connection": new Date().toISOString(), "session_list": [], "clicks": 0, "cookie_id": ""})
session["current_connection"] = new Date().toISOString()
let accessedSocialLinks = getCookie("accessed_social_links", [])
let previousReadPostList = getCookie("previous_read_post_list", [])

// english (en) is not necesary as it is the default landing page
if(navigator.cookieEnabled && language != "en" && window.location.href.substr(window.location.href.lastIndexOf('/') + 1) != "index."+language+".html"){
  window.location.assign("index."+language+".html");
}

// When DOM has been loaded the function is triggered
$(document).ready(function(){

  window.onresize = function(event){
        placeCanvasAndDivider();
        paintNetworkAgain();
        placingBlackDivContact();
        console.log("Width has changed", window.screen.width);
  }

  if(!cookiesAccepted){
    $("#CookieWarning").removeClass('hidden');
  }

  $("#CookieWarning button").on("click", function(){
      cookiesAccepted = true;
      setCookie("cookies", "accepted");
      $("#CookieWarning").css({display:'none'});
      console.log("Cookies have been accepted");
  })

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  NAV_MENU - WELCOME  ////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $(".lang").on("click", function (event) {
        event.stopPropagation();
        language = $(this).attr("data");
        setCookie("language", language);  // If no agreement is set cookie is not set
        if(!cookiesAccepted) { return }
        console.log("Selected language", language);

        if (language != "en") {
            new_location = "index."+language+".html"
        } else {
            new_location = "index.html"
        }

        if (window.location.href.substr(window.location.href.lastIndexOf('/') + 1) != new_location){  // No need of reload location is placed properly
            window.location.assign(new_location);
        }
    });

    // Mark the language selected - either by choice or by default
    $(".lang").each(function(i, obj) {
        if ($(obj).attr("data") == language) {
            $(obj).css({background: "gray"})
        } else {
            $(obj).css({background: "black"})
        }
    });

    // When the user clicks on the button, toggle between hiding and showing the dropdown content
    $(".responsive_menu").on("click", function(event){
        event.stopPropagation();
        $(this).children(".dropdown_button").toggleClass("alt");
        $(this).children(".dropdown_button-content").toggleClass("show");
    });

    // Close the dropdown if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropdown_button')) {
          $('.dropdown_button.alt').toggleClass('alt');
          $(".dropdown_button-content.show").removeClass('show');
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  CANVAS - GRAPH - TEXT  /////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Set position and size to graph and divider initially in the middle
    placeCanvasAndDivider();

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
    $("#text_button").on("click touch", function(event){
        event.stopPropagation();
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
            $(this).css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"}); //Mark the button as used
            $("#graph_button").css({background:"", border:""});
        }
    });

    $("#graph_button").on("click touch", function(event){
        event.stopPropagation();
        clearInterval(interval);
        interval = undefined;
        if ($("#right_graph").width() == Math.round($('#left_text').width())){ // Use of Math.round because, when assigning the width a decimal problem rises
            $("#right_graph").css({'width':Math.round($('#left_text').width()/2)});
            $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
            $(this).css({background:"", border:""});
        }
        else {
            $("#right_graph").css('width', Math.round($('#left_text').width()));
            $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
            $(this).css({background:"darkgray", border: "1px solid #cdcdcd", 'border-radius': "4px"}); //Mark the button as used
            $("#text_button").css({background:"", border:""});
        }
    });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  CONTACT - JS SERVER   //////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let backend_connexion = null;
    placingBlackDivContact();
    base_url = "https://bw3g39ud37.execute-api.eu-west-1.amazonaws.com/live"
    message_url = base_url + "/message"
    analytics_url = base_url + "/analytics"

    $("#message_button i").css({display:'none'});
    $("#message_button .msg_btn_text").css({display:'none'});
    $("#message_button .waiting_text").css({display:'inline-block'});

    // Create the IntersectionObserver  https://developers.google.com/web/updates/2019/02/intersectionobserver-v2
    // To check connection only when contact page loads
    const onIntersection = (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                console.log("Intersecting with: ", entry);
                if(cookiesAccepted){
                    if (backend_connexion == null) {
                        ajax_to_backend(analytics_url, null, function (response) {
                            console.log("Connected with server. Response: ", response);
                            backend_connexion = true;
                            if (session["cookie_id"] == ""){
                                session["cookie_id"] = response["cookie_id"]
                            }
                            $(".block_comm").css({display: 'none'});
                            $("#message_button i").css({display: 'inline-block'});
                            $("#message_button .msg_btn_text").css({display: 'none'});
                            $("#message_button .connected_text").css({display: 'inline-block'});
                        }, function (response) {
                            console.log("Error starting connection");
                            backend_connexion = false;
                            $(".block_comm").css({display: 'block'});
                            $("#message_button i").css({display: 'none'});
                            $("#message_button .msg_btn_text").css({display: 'none'});
                            $("#message_button .error_text").css({display: 'inline-block'});
                        })
                    }
                }
            }
        }
    };

    const observer = new IntersectionObserver(onIntersection);
    observer.observe(document.querySelector('#contact_form'));

    $("#contact_form").submit(function() {
        if(!cookiesAccepted){
            increaseCookieWarning();
            return false;
        }

        if($("#message_button .error_text").css("display") == "inline-block" || $("#message_button .waiting_text").css("display") == "inline-block" || backend_connexion == null || !backend_connexion){
            console.log("Tried to connect without connection");
            return false;
        }

        if($("#message_button .confirmation_text").css("display") == "inline-block"){
            console.log("Message already sent.");
            return false;
        }

        var message = {
            cookie_id: session["cookie_id"],
            first_name: $("input[name~='firstname']").val().toString(),
            telephone: Number($("input[name~='phone']").val().toString().replace(/[^0-9]/g, "")),
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




        if($('.blame_form').length == 0){ //Only send a message when the form is complete
            ajax_to_backend(message_url, JSON.stringify(message), function (data, textStatus, request){
                        $("#firstname").text($("input[name~='firstname']").val());
                        $(".msg_conf_text").css({display: 'block'});
                        $("textarea[name~='message']").css({display: 'none'});

                        $("input[name~='firstname']").val('');
                        $("input[name~='phone']").val('');
                        $("input[name~='email']").val('');
                        $("input[name~='subject']").val('');

                        console.log('>> Confirmation of reception:', message);
                        $("#message_button i").css({display:'none'});
                        $("#message_button .msg_btn_text").css({display:'none'});
                        $("#message_button .confirmation_text").css({display:'inline-block'});
            }, function (data, textStatus, request){
                    console.log("Error sending message. Response was: ", data, textStatus, request);
                    $(".block_comm").css({display:'block'});
                    $("#message_button").addClass("error_sending");
                    $("#message_button .msg_btn_text").css({display:'none'});
                    $("#message_button .error_sending").css({display:'inline-block'});
            });
        } else{
          $("#message_button .msg_btn_text").css({display:'none'});
          $("#message_button .check_text").css({display:'block'});
        }

        return false; // NEED RETURN FALSE to not refresh page and keep values in the form

    });

    // Analytics to check further improvements of the website
    $(window).on("unload", function() {
        session["session_list"].push([session["current_connection"], new Date().toISOString()])
        let jqXHR = ajax_to_backend(analytics_url)
        $.when(jqXHR).then(console.log("Sent"))
        setCookie("session", session)
        setCookie("previous_read_post_list", previousReadPostList.concat(read_content_list))
    });

    $(".social-button").on('click touch', function () {
        accessedSocialLinks.push($(this).attr("data"))
        setCookie("accessed_social_links", accessedSocialLinks)
    });
});

// Function to resize dimensions of black div used to prevent the user write a message
function placingBlackDivContact(){
  $(".block_comm").css({width:Math.round($("#contact_form").width()),
                        height:Math.round($("#contact_form").height() - ( $("#message_button").height() + parseInt($("#message_button").css("margin-top"))) - 5),
                        'margin-top': Math.round($("#Contact h4").height() + parseInt($("#Contact h4").css("margin-top")) + + parseInt($("#Contact h4").css("margin-bottom")))});
}

// Function to set position and size to graph and divider initially in the middle
// Used at the beginning and if someone resize from small size to big size
function placeCanvasAndDivider(){
  if(window.screen.width > 900){
    $("#right_graph").offset({top:$("#left_text").offset().top});
    $("#right_graph").css({'width':Math.round($('#left_text').width()/2),
        'height':$('#left_text').height()});
    $("#divider").css({'right':($('#right_graph').width()+$('#divider').width()),
        'height':$('#left_text').height()});
    $("#divider").offset({top:$("#left_text").offset().top});

    $("#mynetwork").css({'width':$('#left_text').width(),
        'height':$('#left_text').height()});
  }else {
        $("#mynetwork canvas").css({'width':$('#left_text').width(), 'height':'400px'});
  }
}

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

// Functions of w3 school to set, get a check a cookie https://www.w3schools.com/js/js_cookies.asp
expirationDays = 365
function setCookie(cname, cvalue) {
    if (cookiesAccepted) {// New EU data regulation makes the agreement mandatory before any cookie
        var d = new Date();
        d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        document.cookie = cname + "=" + JSON.stringify({"cname": cvalue}) + ";expires=" + d.toUTCString() + ";path=/;SameSite=Strict;";
    }
    else{
        increaseCookieWarning()
    }
}

var incrementalSize = 50
function increaseCookieWarning(){
    var height = $("#CookieWarning").css("height").split("px")[0];
    var paddingTop = $("#CookieWarning").css("padding-top").split("px")[0];
    var fontSize = $("#CookieWarning").css("font-size").split("px")[0];

    $("#CookieWarning").css({"height": (Number(height) + incrementalSize) + "px"})
    $("#CookieWarning").css({"padding-top": (Number(paddingTop) + incrementalSize/2) + "px"})
    $("#CookieWarning").css({"font-size": (Number(fontSize) + incrementalSize/10) + "px"})

}

function getCookie(cname, default_value) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return JSON.parse(c.substring(name.length, c.length))["cname"];
        }
    }
    return default_value;
}

function ajax_to_backend(url, data, success_callback, error_callback){
    let processed_data
    if (data == null){
        processed_data = JSON.stringify({
            "duration": new Date().getTime() - new Date(session["current_connection"]).getTime(),
            "session": [session["current_connection"], new Date().toISOString()],
            "number_of_clicks": session["clicks"],
            "read_post_list": typeof read_content_list === "undefined" ? [] : read_content_list.slice(-10),
            "language": language,
            "accessed_social_links": accessedSocialLinks,
            "cookie_id": session["cookie_id"]
        })
    } else {
        processed_data = data
    }

    let assign_success_callback = success_callback != null ? success_callback : function( data, textStatus, request){console.log("Success ", data, textStatus, request)}
    let assign_error_callback = error_callback != null ? error_callback : function( request, textStatus, errorThrown){console.log("Failure ", request, textStatus, errorThrown)}

    let jqXHR = $.ajax({
        url: url,
        method: "POST",
        crossDomain: true,
        headers: {"content-type":"application/json"},
        dataType: "json",
        data: processed_data,
        xhrFields: {
            withCredentials: false
        }
    });

    jqXHR.done(assign_success_callback)
    jqXHR.fail(assign_error_callback)
    return jqXHR
}