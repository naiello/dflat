var rankAssignments = {};
var fullRoster = [];
var rankNumbers = [];
var sectionName;
var showName;

$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return (Array.isArray(results)) ? results[1] : undefined;
}

function getSectionRoster(callback) {
    // retrieve rank listing from server
    // server returns JSON array of objects
    $.get('api/ranks.php', {
        a: 'roster',
        s: sectionName // HACK
    }).done(function(listing) {
        console.log(listing);
        if (callback) {
            callback(listing.roster, listing.ranks);
        }
    }).fail(function(err) {
        console.log(err);
    });
}

function getSavedRanks(callback) {
    $.get('api/ranks.php', {
        a: 'load',
        s: sectionName,
        show: showName
    }).done(function(listing) {
        console.log(listing);
        if (callback) {
            callback(listing);
        }
    }).fail(function(err) {
        console.log(err);
    });
}

function getShows(callback) {
    $.get('api/ranks.php', {
        a: 'shows'
    }).done(function(listing) {
        console.log(listing);
        if (callback) {
            callback(listing);
        }
    }).fail(function(err) {
        console.log(err);
    });
}

function BandMember(first, last, core, newm, times_core, times_ht, times_pre) {
    this.firstName = first;
    this.lastName = last;
    this.core = (core === 'Y');
    this.newMember = (newm === 'Y');
    this.timesCore = times_core;
    this.timesHT = times_ht || 0;
    this.timesPre = times_pre || 0;
}

function RankAssignment(num, a, b, c, d) {
    this.number = num;
    this.A = a;
    this.B = b;
    this.C = c;
    this.D = d;
    this.generateServerJSON = function() {
        return {
            a_first: this.A.firstName,
            a_last: this.A.lastName,
            b_first: this.B.firstName,
            b_last: this.B.lastName,
            c_first: this.C.firstName,
            c_last: this.C.lastName,
            d_first: this.D.firstName,
            d_last: this.D.lastName,
            number: this.number
        };
    }
}

function generateNewRanks(roster, ranks) {
    var core = [];
    var returners = [];
    var newmem = [];

    var $table = $('table tbody');
    $table.html('');

    var shuffle = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var j = Math.floor(Math.random() * arr.length);
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    var pickCore = function() {
        if (core.length > 0) {
            return core.pop();
        } else if (returners.length > 0) {
            return returners.pop();
        } else {
            return newmem.pop();
        }
    }

    var pickMid = function() {
        if (newmem.length > 0) {
            return newmem.pop();
        } else if (returners.length > 0) {
            return returners.pop();
        } else {
            return newmem.pop();
        }
    }

    roster.forEach(function(person) {
        var mem = new BandMember(person.first_name, person.last_name, person.is_core, person.is_new_member, person.times_ht_alt, person.times_pre_alt);
        fullRoster.push(mem);
        if (mem.core) {
            core.push(mem);
        } else if (mem.newMember) {
            newmem.push(mem);
        } else {
            returners.push(mem);
        }
    });

    shuffle(core);
    shuffle(returners);
    shuffle(newmem);

    ranks.forEach(function(rank) {
        var n = rank.rank;
        var aSpot = pickCore();
        var bSpot = pickMid();
        var cSpot = pickMid();
        var dSpot = pickCore();

        rankAssignments[n] = new RankAssignment(n, aSpot, bSpot, cSpot, dSpot);
        rankNumbers.push(n);
        $row = $('<tr id="row-'+n+'"><th scope="row">'+n+'</th>' +
                '<td id="cell-'+n+'A">' + aSpot.firstName + ' ' + aSpot.lastName + '</td>' +
                '<td id="cell-'+n+'B">' + bSpot.firstName + ' ' + bSpot.lastName + '</td>' +
                '<td id="cell-'+n+'C">' + cSpot.firstName + ' ' + cSpot.lastName + '</td>' +
                '<td id="cell-'+n+'D">' + dSpot.firstName + ' ' + dSpot.lastName + '</td></tr>');

        $table.append($row);
    });

    setDragAndDrop();
}

function saveNew() {
    var ranks = [];
    rankNumbers.forEach(function(r) {
	var rank = rankAssignments[r];
        var row = rank.generateServerJSON();
        ranks.push(row);
        console.log(row);
    });

    $.get('api/ranks.php', {
        a: 'savenew',
        s: sectionName,
        show: showName,
        ranks: JSON.stringify(ranks)
    }).done(function(result) {
        console.log(result);
    }).fail(function(err) {
        console.log(err);
    });
}

function setDragAndDrop() {
    var $tds = $('tbody td');
    var $dragStart = undefined;
    // drag/drop of ranks
    $tds.attr('draggable', true)
        .bind('dragenter', function(evt) {
            evt.preventDefault();
        }).bind('dragover', function(evt) {
            evt.preventDefault();
            $(evt.delegateTarget).addClass('hovering');
        }).bind('dragstart', function (evt) {
            $dragStart = $(evt.delegateTarget);
        }).bind('dragleave', function(evt) {
            evt.preventDefault();
            $(evt.delegateTarget).removeClass('hovering');
        }).bind('drop', function(evt) {
            evt.preventDefault();

            var $target = $(evt.target);
            var name1 = $target.html();
            $target.removeClass('hovering').html($dragStart.html());
            $dragStart.html(name1);

            $target.css('background-color', 'rgb(210, 210, 255)');
            $dragStart.css('background-color', 'rgb(210, 210, 255)');
            var count = 0;

            // fade gray back to white
            var to = setInterval(function() {
                if (count > 45) {
                    clearInterval(to);
                    $('tbody td').css('background-color', 'inherit');
                }

                var gr = 210 + count;
                $target.css('background-color', 'rgb('+gr+', '+gr+', 255)');
                $dragStart.css('background-color', 'rgb('+gr+', '+gr+', 255)');
                count++;
            }, 10);
        });
}

$(function() {

    if ($.urlParam('s') === undefined) {
        getShows(function(shows) {
            var $sel = $('#pick-show');
            shows.forEach(function (show) {
                $sel.append('<option value="'+show.showname+'">'+show.showname+'</option>');
            });
        });

        $('.main').hide();
        var $dialog = $('#choose-section-dialog');
        $dialog.modal();
        $dialog.on('hide.bs.modal', function() {
            window.location.assign(window.location.href + "?s=" + $('#pick-section option:selected').val() + '&show=' + $('#pick-show option:selected').val());
        });
    } else {
        sectionName = $.urlParam('s');
        showName = $.urlParam('show');
        $('.section-name-header').html(sectionName);
        $('.show-name-header').html(showName);
        getSectionRoster(generateNewRanks);
    }
});
