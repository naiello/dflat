<?php

include('config.php');
$section = $_GET['s'];
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
$ranks_sql = 'SELECT rank, alternate AS has_alt FROM ranks WHERE section = ?;';

$roster_query = $db->prepare($roster_sql);
$roster_query->bind_param('s', $section);
$roster_result = $roster_query->execute();
$roster_arr = $roster_query->get_result()->fetch_all(MYSQLI_ASSOC);

$ranks_query = $db->prepare($ranks_sql);
$ranks_query->bind_param('s', $section);
$ranks_result = $ranks_query->execute();
$ranks_arr = $ranks_query->get_results()->fetch_all(MYSQLI_ASSOC);

$result = array(
    'roster' => $roster_arr,
    'ranks' => $ranks_arr
);

header('Content-Type: application/json');
echo json_encode($result);

?>
