$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return (Array.isArray(results)) ? results[1] : undefined;
}

$(function() {
    var sectionName = $.urlParam('s');
    $('.section-name-header').html(sectionName);
    $.get({
        url: 'api/section.php',
        data: {
            s: sectionName
        }
    }).done(function(mem) {
        if (!Array.isArray(mem)) {
            return;
        }

        $table = $('table tbody');
        for (var i = 0; i < mem.length; i++) {
            $table.append('<tr>' +
                '<td>' + mem[i].first_name + '</td>' +
                '<td>' + mem[i].last_name + '</td>' +
                '<td>' + mem[i].class + '</td>' +
                '<td>' + mem[i].level + '</td>' +
                '<td>' + mem[i].status + '</td>' +
                '<td><a href="#">Edit</a></td><tr>'
            );
        }
    }).fail(function(err){
        console.log(err);
        $('.alert-danger .msg').html('Failed to connect to database!');
        $('.alert-danger').slideDown();
    });
});
