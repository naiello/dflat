$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return (Array.isArray(results)) ? results[1] : undefined;
}

function loadMemberList() {
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
            Injury: 'text-bad',
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
                '<td>' + status + '</td>' +
                '<td><a href="#"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a></td><tr>'
            );
        }
    }).fail(function(err){
        console.log(err);
        $('.alert-danger .msg').html('Failed to connect to database!');
        $('.alert-danger').slideDown();
    });
}

$(function() {
    loadMemberList();

    $('#btn-add-member').on('click', () => { $('#inp-mode').val('new'); });
    $('#btn-submit').on('click', $('#update-member-form').submit);
    $('#update-member-form').on('submit', function(event) {
        var mode = $('#inp-mode').val();
        var request = {
            url: 'api/update_member.php',
            data: {
                mode: $('#inp-mode').val(),
                first_name: $('#first-name').val(),
                last_name: $('#last-name').val(),
                section: $.urlParam('s'),
                level: $('input[name=level]:checked').val(),
                status: $('#status option:selected').val(),
                year: parseInt($('#year option:selected').val())
            }
        }
    });
});
