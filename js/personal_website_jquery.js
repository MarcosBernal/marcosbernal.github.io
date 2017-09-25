$(document).ready(function(){
    $("p").click(function(){
        $(this).hide();
        alert("deleting");
    });
});


// When DOM has been loaded the function is triggered
$(document).ready(function(){

    // Set position and size to graph and divider initially in the middle
    $("#divider").css({'left':($('#left_text').width()/2)+10,
                       'height':$('#left_text').height()
                      });
    $("#divider").offset({top:$("#left_text").offset().top});
    $("#right_graph").offset({top:$("#left_text").offset().top});
    $("#right_graph").css({'width':$('#left_text').width()/2,
                           'height':$('#left_text').height()});

    // Refreshing the position of the knowledge graph and text according the mouse position
    var divPos = {};
    var right_graph_pos = 0;
    var offset = $("#left_text").offset();
    $(".switching_content").on("mouseover mousemove", function(e){
        divPos = {
            left: e.pageX - offset.left,
            top: e.pageY - offset.top
        };
        right_graph_pos = $('#left_text').width()-divPos.left;
        $("#right_graph").css('width',right_graph_pos);
        $("#divider").css('left',divPos.left+$('#divider').width());
    });

    //Show completely all introduction either text or graph
    $("#text_button").on("click", function(e){
        $("#right_graph").css('width',0);
        $("#divider").css('left',$("#left_text").width()+$("#divider").width()*2);
    });

    $("#graph_button").on("click", function(e){
        $("#right_graph").css('width',$("#left_text").width());
        $("#divider").css('left',0+$("#divider").width());
    });
});