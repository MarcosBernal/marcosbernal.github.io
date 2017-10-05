// When DOM has been loaded the function is triggered
$(document).ready(function(){

    // Set position and size to graph and divider initially in the middle
    $("#divider").css({'left':($('#left_text').width()/2)+10,
                       'height':$('#left_text').height()
                      });
    $("#divider").offset({top:$("#left_text").offset().top});
    $("#right_graph").offset({top:$("#left_text").offset().top});
    $("#right_graph").css({'width':Math.round($('#left_text').width()/2),
                           'height':$('#left_text').height()});

    $("#mynetwork").css({'width':$('#left_text').width(),
        'height':$('#left_text').height()});

    // Refreshing the position of the knowledge graph and text according the mouse position
    var divPos = {};
    var right_graph_pos = 0;
    var offset = $("#left_text").offset();
    // $(".switching_content").on("mouseover mousemove", function(e){
    //     divPos = {
    //         left: e.pageX - offset.left,
    //         top: e.pageY - offset.top
    //     };
    //     right_graph_pos = $('#left_text').width()-divPos.left;
    //     $("#right_graph").css('width',right_graph_pos);
    //     $("#divider").css('left',divPos.left+$('#divider').width());
    // });
    $(".switching_content").on("mousemove", function(e){
    divPos = {
        left: e.pageX - offset.left,
        top: e.pageY - offset.top
    };
    });
    var interval;
    $("#divider").on("mousedown touchstart", function(e){
        interval = setInterval(function() {
            divPos.left = divPos.left > 0 ? divPos.left : 0;
            divPos.left = divPos.left > $('#left_text').width()+$('#divider').width() ? $('#left_text').width()+$('#divider').width() : divPos.left;
            right_graph_pos = $('#left_text').width() - divPos.left;
            $("#right_graph").css('width', right_graph_pos);
            $("#divider").css('left', divPos.left + $('#divider').width());
            $("p").css('user-select', "none");
            $("img").css('user-select', "none");

        }, 20);
    });
    $("#divider").on("mouseup touchend", function(){
        clearInterval(interval);
        $("p").css('user-select', "auto");
        $("img").css('user-select', "auto");
    });

    //Show completely all introduction either text or graph
    $("#text_button").on("click touch", function(e){
        $("#right_graph").css('width',0);
        $("#divider").css('left',$("#left_text").width()+$("#divider").width());

    });

    $("#graph_button").on("click touch", function(e){
        $("#right_graph").css('width',$("#left_text").width());
        $("#divider").css('left',0+$("#divider").width());
    });

    var speed = 100;
    $(".infobox").on("mouseenter", function () {
        $(this).children().children(".topbar_inside_box").stop().animate(
            {left: $(".inside_box").width()-$(".topbar_inside_box").width()},speed, function (){
                $(this).animate({width:$(".inside_box").width(), left:0},speed*2)});
        $(this).children().children(".rightbar_inside_box").stop().animate(
            {top: $(".inside_box").height()-$(".rightbar_inside_box").height()},speed, function (){
                $(this).animate({height:$(".inside_box").height(), top: 0},speed*2)});
        $(this).children().children(".bottombar_inside_box").stop().animate({left: 0},speed, function (){
            $(this).animate({width:$(".inside_box").width()},speed*2)});
        $(this).children().children(".leftbar_inside_box").stop().animate({top: 0},speed, function (){
            $(this).animate({height:$(".inside_box").height()},speed*2)});
    });

    $(".infobox").on("mouseleave", function () {
        var default_size = $(".infobox").css("--inside-box-dim").replace('px', '');
        $(this).children().children(".topbar_inside_box").stop().animate({width: default_size,left: ($(".inside_box").width()-default_size)/2},speed*2);
        $(this).children().children(".rightbar_inside_box").stop().animate({height: default_size, top: ($(".inside_box").height()-default_size)/2},speed*2);
        $(this).children().children(".bottombar_inside_box").stop().animate({width:default_size, left: ($(".inside_box").width()-default_size)/2},speed*2);
        $(this).children().children(".leftbar_inside_box").stop().animate({height: default_size, top: ($(".inside_box").height()-default_size)/2},speed*2);
    });
});