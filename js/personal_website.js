/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function show_responsive_nav_menu() {
    document.getElementById("myDropdownNav").classList.toggle("show");


    var buttons = document.getElementsByClassName('dropbtn');
    for(var i=0;i<buttons.length;i++) {
        buttons[i].classList.toggle('alt');
    }
}

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
window.onscroll = function() {changeMenu();};
function changeMenu() {
    var navbar_mov = document.getElementById("menu");
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        navbar_mov.classList.remove("hidden");
    } else {
        navbar_mov.classList += " hidden";
    }
}