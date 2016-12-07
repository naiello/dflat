var rankAssignments = {};
var fullRoster = [];

function getSectionRoster(callback) {
    // retrieve rank listing from server
    // server returns JSON array of objects
    $.get('api/ranks.php', {
        a: 'roster',
        s: 'Trombone' // HACK
    }).done(function(listing) {
        console.log(listing);
        if (callback) {
            callback(listing.roster, listing.ranks);
        }
    }).fail(function(err) {
        console.log(err);
    });
}

function getSavedRanks(section, show, callback) {
    $.get('api/ranks.php', {
        a: 'load',
        s: section,
        show: show
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

function RankAssignment(a, b, c, d) {
    return {A: a, B: b, C: c, D: d};
}

function generateNewRanks(roster, ranks) {
    var core = [];
    var returners = [];
    var newmem = [];

    var shuffle = function (arr) {
        for (int i = 0; i < arr.length; i++) {
            var j = Math.floor(Math.random() * arr.length);
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    var pickCore = function() {
        if (!core.empty()) {
            return core.pop();
        } else if (!returners.empty()) {
            return returners.pop();
        } else {
            return newmem.pop();
        }
    }

    var pickMid = function() {
        if (!newmem.empty()) {
            return newmem.pop();
        } else if (!returners.empty()) {
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

        rankAssignments[n] = RankAssignment(aSpot, bSpot, cSpot, dSpot);
        $row = $('<tr id="row-'+r+'"><th scope="row">'+n+'</th>' +
                '<td id="cell-'+r+'A">' + aSpot.firstName + ' ' + aSpot.lastName + '</td>' +
                '<td id="cell-'+r+'B">' + bSpot.firstName + ' ' + bSpot.lastName + '</td>' +
                '<td id="cell-'+r+'C">' + cSpot.firstName + ' ' + cSpot.lastName + '</td>' +
                '<td id="cell-'+r+'D">' + dSpot.firstName + ' ' + dSpot.lastName + '</td></tr>');

        $('table tbody').append($row);
    });
}

$(function() {
    var $tds = $('tbody td');
    var $dragStart = undefined;

    getSectionRoster(generateNewRanks);

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
});
