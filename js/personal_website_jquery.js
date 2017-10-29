// When DOM has been loaded the function is triggered
$(document).ready(function(){

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
    var interval = undefined;
    $("#divider").on("mousedown touchstart", function(e){
        if(interval == undefined){
            interval = setInterval(function() {
                divPos.left = divPos.left > 0 ? divPos.left : 0;
                divPos.left = divPos.left > $('#left_text').width()+$('#divider').width() ? $('#left_text').width()+$('#divider').width() : divPos.left;
                right_graph_pos = $('#left_text').width() - divPos.left;
                $("#right_graph").css('width', right_graph_pos);
                $("#divider").css('right',$('#right_graph').width()+$('#divider').width());
                $("p").css('user-select', "none");
                $("img").css('user-select', "none");
            }, 20);
        }
    });
    $("#divider").on("mouseup touchend", function(){
        clearInterval(interval);
        interval = undefined;
        $("p").css('user-select', "auto");
        $("img").css('user-select', "auto");
    });

    //Show completely all introduction either text or graph
    $("#text_button").on("click touch", function(e){
        clearInterval(interval);
        interval = undefined;
        $("#right_graph").css('width',0);
        $("#divider").css('right',$("#right_graph").width()+$("#divider").width());

    });

    $("#graph_button").on("click touch", function(e){
        clearInterval(interval);
        interval = undefined;
        $("#right_graph").css('width',$("#left_text").width());
        $("#divider").css('right',$("#right_graph").width()+$("#divider").width());
    });
});