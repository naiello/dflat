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

        classYears = [
            "Unknown",
            "Freshman",
            "Sophomore",
            "Junior",
            "Senior",
            "5th Year / Grad"
        ];

        statusColors = {
            Injured: 'text-bad',
            Suspended: 'text-bad',
            Absent: 'text-warn',
            Inactive: 'text-warn'
        }

        $table = $('table tbody');
        var level = "Returning";
        var status;
        for (var i = 0; i < mem.length; i++) {
            if (mem[i].core == "Y") {
                level = "CORE";
            } else if (mem[i].new_member) {
                level = "New Member";
            }
            status = mem[i].status;
            if (status && statusColors.hasOwnProperty(status)) {
                status = '<span class="' + statusColors[status] + '">' + status + "</span>";
            }
            $table.append('<tr>' +
                '<td>' + mem[i].first_name + '</td>' +
                '<td>' + mem[i].last_name + '</td>' +
                '<td>' + classYears[mem[i].year] + '</td>' +
                '<td>' + level + '</td>' +
                '<td>' + tatus + '</td>' +
                '<td><a href="#">Edit</a></td><tr>'
            );
        }
    }).fail(function(err){
        console.log(err);
        $('.alert-danger .msg').html('Failed to connect to database!');
        $('.alert-danger').slideDown();
    });
});
