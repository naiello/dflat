$(function() {
    $.get({
        url: 'api/section.php',
        data: {
            s: 'Falto'
        }
    }).done(function(resp) {
        console.log(resp);
    }).fail(function(err){
        console.log(err);
    });
});
