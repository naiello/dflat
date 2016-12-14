<?php

include('config.php');
$action = $_GET['a'];
$success = FALSE;
// SQL to retrieve listing of members in section and core/alt information
$roster_sql = <<<EOF
    SELECT  b.first_name AS first_name,
            b.last_name AS last_name,
            b.core AS is_core,
            b.new_member AS is_new_member,
            c.core_spot AS times_core,
            a.pregame AS times_pre_alt,
            a.halftime AS times_ht_alt
    FROM band_members AS b
    LEFT JOIN core AS c ON
        c.first_name = b.first_name AND c.last_name = b.last_name
    LEFT JOIN alternates AS a ON
        a.first_name = b.first_name AND a.last_name = b.last_name
    WHERE b.section = ?;
EOF;
$ranks_sql = 'SELECT rank, alternate AS has_alt FROM renumbered WHERE section = ?;';
$shows_sql = 'SELECT DISTINCT showname FROM saved_ranks;';
$shows_filt_sql = 'SELECT DISTINCT showname FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE renumbered.section = ?;';
$load_sql = 'SELECT * FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE showname = ? and section = ?;';
$load_all_sql = 'SELECT * FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE showname = ?;';
$load_dl_sql = 'SELECT first_name, last_name FROM band_members WHERE status = ?;';
$result = array();

if ($action == 'shows') {
    $show_query = '';
    if (array_key_exists('s', $_GET)) {
        $show_query = $db->prepare($shows_filt_sql);
        $show_query->bind_param('s', $_GET['s']);
    } else {
        $show_query = $db->prepare($shows_sql);
    }
    $show_result = $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
} elseif ($action == 'load') {
    $section = $_GET['s'];
    $show = $_GET['show'];
    $show_query = $db->prepare($load_sql);
    $show_query->bind_param('ss', $show, $section);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
} elseif ($action == 'loadAll') {
    $show = $_GET['show'];
    $show_query = $db->prepare($load_all_sql);
    $show_query->bind_param('s', $show);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
} elseif ($action == 'loadDL') {
    $drum = $_GET['d'];
    $show_query = $db->prepare($load_dl_sql);
    $show_query->bind_param('s', $drum);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
}

header('Content-Type: application/json');
echo json_encode($result);

?>
