$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return (Array.isArray(results)) ? results[1] : undefined;
}

function loadMemberList() {
    var sectionName = $.urlParam('s');
    $('.section-name-header').html(sectionName);
    if(sectionName == 'Drumline') {
		$('#stat_label').css('display','block');
		$('#status_dl').css('display','block');
	} else {
		$('#stat_label').css('display','none');
		$('#status_dl').css('display','none');
	}
    // AJAX request to server code -- returns JSON array of member objects
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

        $table = $('table tbody').html('');
        var level;
        var status;
        var $row;
        for (var i = 0; i < mem.length; i++) {
            if (mem[i].core === "Y") {
                level = "CORE";
            } else if (mem[i].new_member === "Y") {
                level = "New Member";
            } else {
                level = "Returning";
            }
            status = mem[i].status;
            if (status && statusColors.hasOwnProperty(status)) {
                status = '<span class="' + statusColors[status] + '">' + status + "</span>";
            }
            // generate a new row for the table
            $row = $('<tr id="tb-row-' + i + '">' +
                '<td>' + mem[i].first_name + '</td>' +
                '<td>' + mem[i].last_name + '</td>' +
                '<td>' + classYears[mem[i].year] + '</td>' +
                '<td>' + level + '</td>' +
                '<td>' + status + '</td>' +
                '<td><a class="edit-member" href="#"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></a>' +
                '<a class="remove-member" href="#"><span class="glyphicon glyphicon-trash"></span></td><tr>'
            );
            // store the JSON data with the edit and delete buttons
            $row.find('.edit-member').data(mem[i]);
            $row.find('.remove-member').data(mem[i]);

            // callback for edit button click
            $row.find('.edit-member').on('click', function(event) {
                // retrieve stored JSON data
                var $target = $(event.delegateTarget);
                var mem = $target.data();

                // set the form to match the stored values
                $('#add-mode').val('update');
                $('#first-name').val(mem.first_name).prop('disabled', true);
                $('#last-name').val(mem.last_name).prop('disabled', true);
                $('#year').val(mem.year);
                if (mem.core === "Y") {
                    $('input[name=level][value=core]').prop('checked', true);
                } else if (mem.new_member === "Y") {
                    $('input[name=level][value=new]').prop('checked', true);
                } else {
                    $('input[name=level][value=ret]').prop('checked', true);
                }
                $('#status').val(mem.status);

                // show the dialog box
                $('#update-member-dialog').modal();
            });

            // callback for delete button click
            $row.find('.remove-member').on('click', function(event) {
                var mem = $(event.delegateTarget).data();
                var $dialog = $('#delete-member-dialog');
                $dialog.find('#del-dialog-first-name').html(mem.first_name);
                $dialog.find('#del-dialog-last-name').html(mem.last_name);
                $dialog.data(mem);
                $dialog.modal();
            });

            // add row to table
            $table.append($row);
        }
    }).fail(function(err) {
        console.log(err);
        $('.alert-danger .msg').html('Failed to connect to database!');
        $('.alert-danger').slideDown();
    });
}

$(function() {
    if ($.urlParam('s') === undefined) {
        $('.main').hide();
        var $dialog = $('#choose-section-dialog');
        $dialog.modal();
        $dialog.on('hide.bs.modal', function() {
            window.location.assign(window.location.href + "?s=" + $('#pick-section option:selected').val());
        });
    }
    loadMemberList();

    $('#btn-add-member').on('click', function(e) {
        // clear and show form
        $('#add-mode').val('new');
        $('#first-name').val('').prop('disabled', false);
        $('#last-name').val('').prop('disabled', false);
        $('#update-member-dialog').modal();
    });
    $('#btn-submit').on('click', () => {
        $('#update-member-form').submit()
    });
    $('#update-member-form').on('submit', function(event) {
        // add a new member to the database
        event.preventDefault();
        $('#update-member-dialog').modal('hide');
        var mode = $('#add-mode').val();
        $.post('api/update_member.php', {
            mode: $('#add-mode').val(),
            first_name: $('#first-name').val(),
            last_name: $('#last-name').val(),
            section: $.urlParam('s'),
            level: $('input[name=level]:checked').val(),
            status: ($('#status option:selected').val() == "" && $.urlParam('s') == "Drumline") ? $('#status_dl option:selected').val() : $('#status option:selected').val(),
            year: parseInt($('#year option:selected').val())
        }).done(function(result) {
            console.log(result);
            loadMemberList();
        }).fail(function(err) {
            console.log(err);
        });
    });
    $('#btn-submit-del').on('click', function (event) {
        var mem = $('#delete-member-dialog').data();
        if (!mem || !mem.hasOwnProperty('first_name') || !mem.hasOwnProperty('last_name')) {
            console.log('invalid delete');
            return;
        }

        $.post('api/update_member.php', {
            mode: 'delete',
            first_name: mem.first_name,
            last_name: mem.last_name
        }).done(function(resp) {
            console.log('delete success');
            var $dialog = $('#delete-member-dialog');
            $dialog.data({});
            $dialog.modal('hide');
            loadMemberList();
        }).fail(function(resp) {
            console.log(resp);
        });
    });
});
