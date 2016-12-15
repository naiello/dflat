$.urlParam = function(name) {
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	return (Array.isArray(results)) ? decodeURI(results[1]) : undefined;
}

function loadRanks() {
	var game = $.urlParam('g');
	var $table = $('table tbody').html('');
	$('.game-name-header').html(game);

	// AJAX request
	$.get({
		url: 'api/parade.php',
		data: {
			a: 'loadAll',
			show: $.urlParam('g')
		},
		async: false
	}).done(function(ranks) {
		if(!Array.isArray(ranks)) {
			return;
		}

		if (ranks.length < 78) { //checks for missing ranks
			var $el = $('#missing');
			$el.append("Warning: Not all ranks have been generated for this show");
		}

		for(var i = 0; i < ranks.length; i=i+2) {
			if ((i+1) < ranks.length) {
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
				'<td>' + ranks[i+1].rank + '</td></tr>'
				);
			} else {
				$row = $('<tr id="tb-row-' + i + '">' +
				'<td>' + ranks[i].rank + '</td>' +
				'<td>' + ranks[i].d_first + ' ' + ranks[i].d_last + '</td>' +
				'<td>' + ranks[i].c_first + ' ' + ranks[i].c_last + '</td>' +
				'<td>' + ranks[i].b_first + ' ' + ranks[i].b_last + '</td>' +
				'<td>' + ranks[i].a_first + ' ' + ranks[i].a_last + '</td></tr>'
				);
			}
			$table.append($row);
			// insert drums and basses here
			if(ranks[i+1].rank==36) {
				// Drums
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						d: 'SN'
					},
					async: false
				}).done(function(snare) {
					if(!Array.isArray(snare)) {
						return;
					}
					var sn = '<tr id="tb-row-sn"><td>SN</td>';
					for(var j = 0; j < snare.length; j=j+1) {
						sn = sn + '<td>' + snare[j].first_name + ' ' + snare[j].last_name + '</td>';
					}
					sn = sn + '</tr>';
					$row = $(sn);
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						d: 'TN'
					},
					async: false
				}).done(function(tenors) {
					if(!Array.isArray(tenors)) {
						return;
					}
					var tn = '<tr id="tb-row-tn"><td>TN</td>';
					for(var j = 0; j < tenors.length; j=j+1) {
						tn = tn + '<td>' + tenors[j].first_name + ' ' + tenors[j].last_name + '</td>';
					}
					tn = tn + '</tr>';
					$row = $(tn);
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						d: 'BD'
					},
					async: false
				}).done(function(bass) {
					if(!Array.isArray(bass)) {
						return;
					}
					var bd = '<tr id="tb-row-bd"><td>BD</td>';
					for(var j = 0; j < bass.length; j=j+1) {
						bd = bd + '<td>' + bass[j].first_name + ' ' + bass[j].last_name + '</td>';
					}
					bd = bd + '</tr>';
					$row = $(bd);
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						d: 'CYM'
					},
					async: false
				}).done(function(cymbal) {
					if(!Array.isArray(cymbal)) {
						return;
					}
					var cym = '<tr id="tb-row-cym"><td>CYM</td>';
					for(var j = 0; j < cymbal.length; j=j+1) {
						cym = cym + '<td>' + cymbal[j].first_name + ' ' + cymbal[j].last_name + '</td>';
					}
					cym = cym + '</tr>';
					$row = $(cym);
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadDL',
						d: 'KEY'
					},
					async: false
				}).done(function(mallet) {
					if(!Array.isArray(mallet)) {
						return;
					}
					var key = '<tr id="tb-row-key"><td>KEY</td>';
					for(var j = 0; j < mallet.length; j=j+1) {
						key = key + '<td>' + mallet[j].first_name + ' ' + mallet[j].last_name + '</td>';
					}
					key = key + '</tr>';
					$row = $(key);
					$table.append($row);
				}).fail(function(err) {
					console.log(err);
				});
				// Basses
				$.get({
					url: 'api/parade.php',
					data: {
						a: 'loadSec',
						s: 'Bass'
					},
					async: false
				}).done(function(basses) {
					if(!Array.isArray(basses)) {
						return;
					}
					var b = '';
					for(var j = 0; j < basses.length; j=j+1) {
						if(j % 3 == 0) {
							b = '<tr id="tb-row-b' + j + '"><td>BASS</td>';
						}
						b = b + '<td>' + basses[j].first_name + ' ' + basses[j].last_name + '</td>';
						if(j % 3 == 2) {
							b = b + '<td></td><td></td><td></td><td></td><td></td><td></td></tr>';
							$row = $(b);
							$table.append($row);

						} else if (j == (basses.length-1)) {
							if(j % 3 == 0) {
								b = b + '<td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
							} else {
								b = b + '<td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
							}
							$row = $(b);
							$table.append($row);
						}
					}
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

	$.get({
		url: 'api/parade.php',
		data: {
			a: 'loadAlt'
		}
	}).done(function(alternates) {
		if(!Array.isArray(alternates)) {
			return;
		}
		var alt = '';
		for(var j = 0; j < alternates.length; j=j+1) {
			if(j % 8 == 0) {
				alt = '<tr id="tb-row-alt' + j + '"><td>Alt.</td>';
			}
			alt = alt + '<td>' + alternates[j].first_name + ' ' + alternates[j].last_name + '</td>';
			if(j % 8 == 7) {
				alt = alt + '<td>Alt.</td></tr>';
				$row = $(alt);
				$table.append($row);
			} else if(j == (alternates.length-1)) {
				alt = alt + '</tr>';
				$row = $(alt);
				$table.append($row);	
			}
		}
	}).fail(function(err) {
		console.log(err);
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

			for(var i = 0; i < show.length; i++) {
				var $opt = $('<option></option>');
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
