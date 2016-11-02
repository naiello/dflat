<?php
$servername = "localhost";
$username = "naiello";
$password = "correcthorsebatterystaple";
$dbname = "db";

$db = new mysqli($servername, $username, $password, $dbname);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$first = $_POST["first_name"];
$last = $_POST["last_name"];
$section = $_POST["section"];
$year = $_POST["year"];
$core = NULL;
$new_member = NULL;
if (!empty($_POST["level"])) {
    $core = ($_POST["level"] === "core") ? "Y" : NULL;
    $year = ($_POST["level"] === "new") ? "Y" : NULL;
}
$status = (empty($_POST["status"])) ? NULL : $_POST["status"];

if ($_POST["mode"] == "new") {
    $sql = $db->prepare("INSERT INTO band_members VALUES (?, ?, ?, ?, ?, ?, ?)");
}

$sql->bind_param("sssssss", $first, $last, $section, $year, $core, $new_member, $status);

$result = $sql->execute();
$json = "{'success': " . $result . "}";

header('Content-Type: application/json');
echo $json;

?>
