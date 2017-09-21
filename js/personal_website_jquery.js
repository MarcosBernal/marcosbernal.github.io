$(document).ready(function(){
    $("p").click(function(){
        $(this).hide();
        alert("deleting");
    });
});
$(document).ready(function(){
    $("#right_graph").click(function () {
        if($(this).width() == $("#left_text").width()-100) {
            $(this).animate({'width': 400}, 500);
        }
        else {
            $(this).animate({'width': $("#left_text").width()-100}, 500);
        }
    });
});