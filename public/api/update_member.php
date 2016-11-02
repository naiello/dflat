<?php
$servername = "localhost";
$username = "naiello";
$password = "correcthorsebatterystaple";
$dbname = "db";

$db = new mysqli($servername, $username, $password, $dbname);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

if ($_POST["mode"] == "new") {
    $sql = "INSERT INTO band_members (last_name, first_name, section, year, core, new_member, status) ";
    $sql .= "('" . $_POST['last_name'] . "',";
    $sql .= "'" . $_POST['first_name'] . "',";
    $sql .= "'" . $_POST['section'] . "',";
    $sql .= $_POST['year'] . ",";
    if ($_POST['level'] == "core") {
        $sql .= "'Y',";
    } else {
        $sql .= "NULL,";
    }
    if ($_POST['level'] == "new") {
        $sql .= "'Y',";
    } else {
        $sql .= "NULL,";
    }
    if ($_POST['status'] == "") {
        $sql .= "NULL";
    } else {
        $sql .= "'" . $_POST["status"] . "'";
    }
    $sql .= ");"
}

$result = $db->query($sql);
$json = array(
    "status" => $result,
    "sql" => $sql,
);

header('Content-Type: application/json');
echo json_encode($json);

?>
