$.urlParam = function(name) {
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return (Array.isArray(results)) ? results[1] : undefined;
}

function loadRanks() {
	var game = $.urlParam('g');
	$('.game-name-header').html(game);

	// AJAX request
	$.get({
		url: 'api/parade.php',
		data: {
			a: 'loadAll',
			show: 'MSU'
		}
	}).done(function(ranks) {
		if(!Array.isArray(ranks)) {
			return;
		}

		$table = $('table tbody').html('');
		for(var i = 0; i < ranks.length; i=i+2) {
			$row = $('<tr id="tb-row-' + i + '">' +
			'<td>' + ranks[i].rank + '</td>' +
			'<td>' + ranks[i].d_first + ' ' + ranks[i].d_last + '</td>' +
			'<td>' + ranks[i].c_first + ' ' + ranks[i].c_last + '</td>' +
			'<td>' + ranks[i].b_first + ' ' + ranks[i].b_last + '</td>' +
			'<td>' + ranks[i].a_first + ' ' + ranks[i].a_last + '</td>' +
			'<td>' + ranks[i+1].d_first + ' ' + ranks[i+1].d_last + '</td>' +
			'<td>' + ranks[i+1].c_first + ' ' + ranks[i+1].c_last + '</td>' +
			'<td>' + ranks[i+1].b_first + ' ' + ranks[i+1].b_last + '</td>' +
			'<td>' + ranks[i+1].a_first + ' ' + ranks[i+1].a_last + '</td>' +
			'<td>' + ranks[i+1].rank + '</td>'
			);
			$table.append($row);
			// insert drums and basses here
			if(ranks[i+1].rank==36) {
				// AJAX request
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						drum: 'SN'
					}
				}).done(function(snare) {
					if(!Array.isArray(snare)) {
						return;
					}
					var sn = '<tr id="tb-row-sn"><td>SN</td>'
					for(var j = 0; j < snare.length; i=i+1) {
						sn = sn + '<td>' + snare[i].first_name + ' ' + snare[i].last_name + '</td>'
					}
					$row = sn
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
			}
		}
	}).fail(function(err) {
		console.log(err);
		$('.alert-danger .msg').html('Failed to connect to database!');
		$('.alert-danger').slideDown();
	});
}

$(function() {
	if($.urlParam('g') === undefined) {
		$('.main').hide();
		var $dialog = $('#choose-game-dialog');
		$.get({
			url: 'api/parade.php',
			data: {
				a: 'shows'
			}
		}).done(function(show) {
			if(!Array.isArray(show)) {
				return;
			}

			var $opt = $('<option></option>');
			for(var i = 0; i < show.length; i++) {
				$opt.val(show[i].showname);
				$opt.html(show[i].showname);
				$('#pick-game').append($opt);
			}
			$dialog.modal();
			$dialog.on('hide.bs.modal', function() {
				window.location.assign(window.location.href + "?g=" + $('#pick-game option:selected').val());
			});
		});
	}
	loadRanks();
});
