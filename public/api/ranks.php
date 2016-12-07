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
$load_sql = 'SELECT * FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE showname = ? and section = ?;';
$load_sql = 'SELECT * FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE showname = ?;';
$ins_sql = 'INSERT INTO saved_ranks (a_first, a_last, b_first, b_last, c_first, c_last, d_first, d_last, rank, showname) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
$update_sql = 'UPDATE saved_ranks SET a_first = ?, a_last = ?, b_first = ?, b_last = ?, c_first = ?, c_last = ?, d_first = ?, d_last = ? WHERE rank = ? and showname = ?;';
$result = array();

if ($action == 'roster') {
    $section = $_GET['s'];
    $roster_query = $db->prepare($roster_sql);
    $roster_query->bind_param('s', $section);
    $roster_result = $roster_query->execute();
    $roster_arr = $roster_query->get_result()->fetch_all(MYSQLI_ASSOC);

    $ranks_query = $db->prepare($ranks_sql);
    $ranks_query->bind_param('s', $section);
    $ranks_result = $ranks_query->execute();
    $ranks_arr = $ranks_query->get_result()->fetch_all(MYSQLI_ASSOC);
    $result = array(
        'roster' => $roster_arr,
        'ranks' => $ranks_arr
    );
} elseif ($action == 'shows') {
    $show_query = $db->prepare($shows_sql);
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
    $show_query = $db->prepare($load_sql);
    $show_query->bind_param('s', $show);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
} elseif ($action == 'update') {
    $section = $_GET['s'];
    $show = $_GET['show'];
    $ranks = json_decode($_GET['ranks'], TRUE);
    $update_query = $db->prepare($update_sql);
    foreach ($ranks as $rank) {
        $update_query->bind_param('ssssssssss', $rank['a_first'], $rank['a_last'],
                $rank['b_first'], $rank['b_last'],
                $rank['c_first'], $rank['c_last'],
                $rank['d_first'], $rank['d_last'],
                $rank['number'], $show);
        $success = $update_query->execute();
        $update_query->get_result()->fetch_all();
    }
    $result = array('success' => $success);
} elseif ($action == 'savenew') {
    $section = $_GET['s'];
    $show = $_GET['show'];
    $ranks = json_decode($_GET['ranks'], TRUE);
    $ins_query = $db->prepare($ins_sql);
    foreach ($ranks as $rank) {
        $ins_query->bind_param('ssssssssss', $rank['a_first'], $rank['a_last'],
                $rank['b_first'], $rank['b_last'],
                $rank['c_first'], $rank['c_last'],
                $rank['d_first'], $rank['d_last'],
                $rank['number'], $show);
        $success = $ins_query->execute();
        $ins_query->get_result();
    }
    $result = array('success' => $success);
}

header('Content-Type: application/json');
echo json_encode($result);

?>
