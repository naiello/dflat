<?php

include('config.php');
$action = $_GET['a'];

$shows_sql = 'SELECT DISTINCT showname FROM saved_ranks;';
$load_all_sql = 'SELECT * FROM saved_ranks INNER JOIN renumbered ON saved_ranks.rank = renumbered.rank WHERE showname = ?;';
$load_dl_sql = 'SELECT * FROM band_members WHERE status = ?;';
$load_sec_sql = 'SELECT * FROM band_members WHERE section = ?;';
$load_alt_sql = 'SELECT * FROM band_members, saved_ranks WHERE saved_ranks.alt_first = band_members.first_name AND saved_ranks.alt_last = band_members.last_name AND saved_ranks.showname = ?;'; 
$result = array();

if ($action == 'shows') {
    $show_query = $db->prepare($shows_sql);
    $show_result = $show_query->execute();
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
} elseif ($action == 'loadSec') {
    $section = $_GET['s'];
    $show_query = $db->prepare($load_sec_sql);
    $show_query->bind_param('s', $section);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
} elseif ($action == 'loadAlt') {
    $show = $_GET['show'];
    $show_query = $db->prepare($load_alt_sql);
    $show_query->bind_param('s', $show);
    $show_query->execute();
    $result = $show_query->get_result()->fetch_all(MYSQLI_ASSOC);
}

header('Content-Type: application/json');
echo json_encode($result);

?>
