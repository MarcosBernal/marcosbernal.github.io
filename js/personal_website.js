// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }

        var buttons = document.getElementsByClassName('dropbtn alt');
        for(var i=0;i<buttons.length;i++) {
            buttons[i].classList.toggle('alt');
        }
    }
}


// Change style of navbar on scroll
window.onscroll = function() {
    changeMenu();
    smartShowingMenu();
}


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function show_responsive_nav_menu() {
    document.getElementById("myDropdownNav").classList.toggle("show");


    var buttons = document.getElementsByClassName('dropbtn');
    for(var i=0;i<buttons.length;i++) {
        buttons[i].classList.toggle('alt');
    }
}


//Hides the floating menu when the window is in welcome page
function changeMenu() {
    var navbar_mov = document.getElementById("menu");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        navbar_mov.classList.remove("hidden");
    } else {
        navbar_mov.classList += " hidden";
    }
}


var previousScroll = window.scrollY;
function smartShowingMenu(){
    var senseSpeed = 0;
    var navbar_mov = document.getElementById("menu");

    if (window.scrollY-senseSpeed > previousScroll && ! navbar_mov.classList.contains("hidden")){
        navbar_mov.classList += " hidden";
    } else if (window.scrollY+senseSpeed < previousScroll) {
        navbar_mov.classList.remove("hidden");
    }
    previousScroll = navbar_mov.scrollTop;
}
// Mirar como hacer para guardar el navegador


window.onload = function(event) {
    rect_measures = document.getElementsByClassName("left_text").item(0).getBoundingClientRect();
    left_text_style = window.getComputedStyle(document.getElementsByClassName("left_text").item(0));
    right_graph_div = document.getElementsByClassName("right_graph").item(0);

    right_graph_div.style.top = rect_measures.top;
    right_graph_div.style.marginTop = left_text_style.marginTop;
    right_graph_div.style.marginBottom = left_text_style.marginBottom;
    right_graph_div.style.height = rect_measures.height + 'px';
    right_graph_div.style.width = rect_measures.width + 'px';
}

function GetBox (element) {
    var div = document.getElementById (element);

    if (div.getBoundingClientRect) {        // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
        var rect = div.getBoundingClientRect ();
        x = rect.left;
        y = rect.top;
        w = rect.right - rect.left;
        h = rect.bottom - rect.top;

        alert (" Left: " + x + "\n Top: " + y + "\n Width: " + w + "\n Height: " + h);
    }
    else {
        alert ("Your browser does not support this example!");
    }
}