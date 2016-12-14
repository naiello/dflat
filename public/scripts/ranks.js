var rankAssignments = {};
var fullRoster = [];
var rankNumbers = [];
var sectionName;
var showName;

$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return (Array.isArray(results)) ? decodeURI(results[1]) : undefined;
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

function getShows(section, callback) {
    var args = {
        a: 'shows'
    };
    if (section) {
        args.s = section;
    }
    $.get('api/ranks.php', args)
        .done(function(listing) {
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

    var shuffle = function(arr) {
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

    var pickNew = function() {
        if (newmem.length > 0) {
            return newmem.pop();
        } else if (returners.length > 0) {
            return returners.pop();
        } else {
            return core.pop();
        }
    }

    var pickRet = function() {
        if (returners.length > 0) {
            return returners.pop();
        } else if (newmem.length > 0) {
            return newmem.pop();
        } else {
            return core.pop();
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
        var bSpot = pickNew();
        var cSpot = pickRet();
        var dSpot = pickCore();

        rankAssignments[n] = new RankAssignment(n, aSpot, bSpot, cSpot, dSpot);
        rankNumbers.push(n);
        $row = $('<tr id="row-' + n + '"><th scope="row">' + n + '</th>' +
            '<td id="cell-' + n + 'A">' + aSpot.firstName + ' ' + aSpot.lastName + '</td>' +
            '<td id="cell-' + n + 'B">' + bSpot.firstName + ' ' + bSpot.lastName + '</td>' +
            '<td id="cell-' + n + 'C">' + cSpot.firstName + ' ' + cSpot.lastName + '</td>' +
            '<td id="cell-' + n + 'D">' + dSpot.firstName + ' ' + dSpot.lastName + '</td></tr>');

        var rowTag = 'cell-' + n;
        $row.data({rankNumber: n});
        /*$row.find(rowTag + 'A').data(aSpot);
        $row.find(rowTag + 'B').data(bSpot);
        $row.find(rowTag + 'C').data(cSpot);
        $row.find(rowTag + 'D').data(dSpot);*/
        $table.append($row);
    });

    setDragAndDrop();
    saveNew();
}

function saveNew() {
    var ranks = [];
    rankNumbers.forEach(function(r) {
        var rank = rankAssignments[r];
        var row = rank.generateServerJSON();
        ranks.push(row);
        console.log(row);
    });

    $('#save-status').removeClass('text-bad').html('Saving...');

    $.get('api/ranks.php', {
        a: 'savenew',
        s: sectionName,
        show: showName,
        ranks: JSON.stringify(ranks)
    }).done(function(result) {
        console.log(result);
        $('#save-status').html('All changes saved.');
    }).fail(function(err) {
        console.log(err);
        $('#save-status').addClass('text-bad').html('Error saving changes.');
    });
}

function saveUpdates() {
    var ranks = [];
    rankNumbers.forEach(function(r) {
        var rank = rankAssignments[r];
        var row = rank.generateServerJSON();
        ranks.push(row);
        console.log(row);
    });

    $('#save-status').removeClass('text-bad').html('Saving...');

    $.get('api/ranks.php', {
        a: 'update',
        s: sectionName,
        show: showName,
        ranks: JSON.stringify(ranks)
    }).done(function(result) {
        console.log(result);
        $('#save-status').html('All changes saved.');
    }).fail(function(err) {
        console.log(err);
        $('#save-status').addClass('text-bad').html('Error saving changes.');
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
        }).bind('dragstart', function(evt) {
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

            /*var data1 = $target.data();
            $target.data($dragStart.data());
            $dragStart.data(data1);*/

            var id1 = $dragStart.attr('id');
            var id2 = $target.attr('id');
            var spot1 = id1.substring(id1.length-1);
            var spot2 = id2.substring(id2.length-1);
            var num1 = $dragStart.parent().data().rankNumber;
            var num2 = $target.parent().data().rankNumber;
            var rank1 = rankAssignments[num1];
            var rank2 = rankAssignments[num2];
            var temp = rank1[spot1];
            rank1[spot1] = rank2[spot2];
            rank2[spot2] = temp;

            saveUpdates();

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
                $target.css('background-color', 'rgb(' + gr + ', ' + gr + ', 255)');
                $dragStart.css('background-color', 'rgb(' + gr + ', ' + gr + ', 255)');
                count++;
            }, 10);
        });
}

function findMember(first, last) {
    for (var i = 0; i < fullRoster.length; i++) {
        if (fullRoster[i].firstName === first && fullRoster[i].lastName === last) {
            return fullRoster[i];
        }
    }
}

function populateTable(ranks) {
    rankAssignments = {};
    var $table = $('table tbody');
    $table.html('');
    ranks.forEach(function (rank) {
        var aSpot = findMember(rank.a_first, rank.a_last);
        var bSpot = findMember(rank.b_first, rank.b_last);
        var cSpot = findMember(rank.c_first, rank.c_last);
        var dSpot = findMember(rank.d_first, rank.d_last);

        rankAssignments[rank.rank] = new RankAssignment(rank.rank, aSpot, bSpot, cSpot, dSpot);
        var $row = $('<tr id="row-'+rank.rank+'"><th scope="row">' + rank.rank + '</th>' +
            '<td id="cell-'+rank.rank+'A">' + aSpot.firstName + ' ' + aSpot.lastName + '</td>' +
            '<td id="cell-'+rank.rank+'B">' + bSpot.firstName + ' ' + bSpot.lastName + '</td>' +
            '<td id="cell-'+rank.rank+'C">' + cSpot.firstName + ' ' + cSpot.lastName + '</td>' +
            '<td id="cell-'+rank.rank+'D">' + dSpot.firstName + ' ' + dSpot.lastName + '</td></tr>');

        var rowTag = 'cell-' + rank.rank;
        $row.data({rankNumber: rank.rank});
        /*$row.find(rowTag + 'A').data(aSpot);
        $row.find(rowTag + 'B').data(bSpot);
        $row.find(rowTag + 'C').data(cSpot);
        $row.find(rowTag + 'D').data(dSpot);*/
        $table.append($row);
    });

    setDragAndDrop();
}

$(function() {
    var newShow = false;

    $('#btn-new-show-add').on('click', function() {
        $('#group-new-show').show();
        $('#group-current-shows').hide();
        newShow = true;
    });

    $('#btn-new-show-cancel').on('click', function() {
        $('#group-new-show').hide();
        $('#group-current-shows').show();
        newShow = false;
    });

    if (!$.urlParam('s') || !$.urlParam('show')) {
        getShows('', function(shows) {
            var $sel = $('#pick-show');
            shows.forEach(function(show) {
                $sel.append('<option value="' + show.showname + '">' + show.showname + '</option>');
            });
        });

        $('#pick-show, #pick-section').on('change', function () {
            if (newShow) {
                $('#do-ranks-exist').html('New ranks will be generated.');
                return;
            }
            $.get('api/ranks.php', {
                a: 'shows',
                s: $('#pick-section option:selected').val()
            }).done(function(result) {
                var found = false;
                var curShow = $('#pick-show option:selected').val();
                result.forEach(function(show) {
                    if (show.showname === curShow) {
                        found = true;
                    }
                });

                if (found) {
                    $('#do-ranks-exist').html('Existing ranks found.');
                } else {
                    $('#do-ranks-exist').html('New ranks will be generated.');
                }
            });
        });

        $('#table-content').hide();
        $('#choose-section-dialog').show();
        var $form = $('#form-choose-ranks');
        $form.show();
        $form.on('submit', function(evt) {
            evt.preventDefault();
            var showName = (newShow) ? $('#inp-new-show-name').val() : $('#pick-show option:selected').val();
            if (!showName) {
                return;
            }
            window.location.assign(window.location.href + "?s=" + $('#pick-section option:selected').val() + '&show=' + showName);
        });
    } else {
        sectionName = $.urlParam('s');
        showName = $.urlParam('show');
        $('.section-name-header').html(sectionName);
        $('.show-name-header').html(showName);

        getShows(sectionName, function(shows) {
            var newRanks = true;
            for (var i = 0; i < shows.length; i++) {
                if (shows[i].showname === showName) {
                    newRanks = false;
                }
            }

            if (newRanks) {
                getSectionRoster(generateNewRanks);
                saveNew();
            } else {
                getSectionRoster(function (roster, ranks) {
                    roster.forEach(function (person) {
                        var mem = new BandMember(person.first_name, person.last_name, person.is_core, person.is_new_member, person.times_ht_alt, person.times_pre_alt);
                        fullRoster.push(mem);
                    });

                    ranks.forEach(function (rank) {
                        rankNumbers.push(rank.rank);
                    });

                    getSavedRanks(populateTable);
                });
            }
        });
    }
});
