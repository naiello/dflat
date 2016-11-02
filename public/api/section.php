<?php
$servername = "dsg1.crc.nd.edu";
$username = "naiello";
$password = "correcthorsebatterystaple";
$dbname = "Db"

$db = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM band_members WHERE section = '" . $_GET["s"] . "';";
$result = $db->query($sql);
$json = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($json, $row);
    }
}

echo json_encode($json);

?>
