// make form appear when someone clicks "add comment"
$( "#click-to-open" ).click(function() {
  $( ".show-onclick" ).toggle();
});


// make form trigger submit when enter is clicked

$("textarea").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {
        $(this).closest("form").submit();
        e.preventDefault();
    }
});

$("#toggle-amenities").click(function() {
  $( "#amenities" ).toggle();
})

$(".fa-caret-down").click(function() {
  $(".fa-caret-down").toggle();
  $(".fa-caret-up").toggle();
})

$(".fa-caret-up").click(function() {
  $(".fa-caret-down").toggle();
  $(".fa-caret-up").toggle();
})
