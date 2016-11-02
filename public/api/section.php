<?php
$servername = "localhost";
$username = "naiello";
$password = "correcthorsebatterystaple";
$dbname = "db";

$db = new mysqli($servername, $username, $password, $dbname);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$sql = "SELECT * FROM band_members WHERE section = '" . $_GET["s"] . "';";
$result = $db->query($sql);
$json = array();

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($json, $row);
    }
}

echo json_encode($json);

?>
