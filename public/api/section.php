<?php
include('config.php');

$sql = "SELECT * FROM band_members WHERE section = '" . $_GET["s"] . "' ORDER BY year DESC, last_name;";
$result = $db->query($sql);
$json = array();

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($json, $row);
    }
}

header('Content-Type: application/json');
echo json_encode($json);

?>
