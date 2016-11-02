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
		var $row;
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
            $row = $('<tr id="tb-row-' + i + '">' +
                '<td>' + mem[i].first_name + '</td>' +
                '<td>' + mem[i].last_name + '</td>' +
                '<td>' + classYears[mem[i].year] + '</td>' +
                '<td>' + level + '</td>' +
                '<td>' + status + '</td>' +
                '<td><a href="#"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a></td><tr>'
            );
			$row.find('a').data(mem[i]);
                        $row.find('a').on('click', function (event) {
				var $target = $(event.delegateTarget);
				var mem = $target.data();
				$('#add-mode').val('update');
				$('#first-name').val(mem.first_name);
				$('#last-name').val(mem.last_name);
				$('#year').val(mem.year);
				if (mem.core === "Y") {
					$('input[name=level][value=core]').prop('checked', true);
				} else if (mem.new_member === "Y") {
					$('input[name=level][value=new]').prop('checked', true);
				} else {
					$('input[name=level][value=ret]').prop('checked', true);
				}
				$('#status').val(mem.status);
				$('#update-member-dialog').modal();
			});
			$table.append($row);
        }
    }).fail(function(err){
        console.log(err);
        $('.alert-danger .msg').html('Failed to connect to database!');
        $('.alert-danger').slideDown();
    });
}

$(function() {
    loadMemberList();

    $('#btn-add-member').on('click', function (e) {
		$('#add-mode').val('new');
		$('#first-name').val('');
		$('#last-name').val('');
		$('#update-member-dialog').modal();
	});
    $('#btn-submit').on('click', () => { $('#update-member-form').submit() });
    $('#update-member-form').on('submit', function(event) {
        event.preventDefault();
        var mode = $('#add-mode').val();
        $.post('api/update_member.php', {
            mode: $('#add-mode').val(),
            first_name: $('#first-name').val(),
            last_name: $('#last-name').val(),
            section: $.urlParam('s'),
            level: $('input[name=level]:checked').val(),
            status: $('#status option:selected').val(),
            year: parseInt($('#year option:selected').val())
        }).done(function(result) {
            console.log(result);
        }).fail(function(err) {
            console.log(err);
        });
    });
});
