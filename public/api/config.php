<?php
$servername = "localhost";
$username = "naiello";
$password = "correcthorsebatterystaple";
$dbname = "db";

$db = new mysqli($servername, $username, $password, $dbname);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

?>
