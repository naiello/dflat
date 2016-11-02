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
$section = (empty($_POST["section"])) ? "" : $_POST["section"];
$year = (empty($_POST["year"])) ? "" : $_POST["year"];
$core = "";
$new_member = "";
if (!empty($_POST["level"])) {
    $core = ($_POST["level"] === "core") ? "Y" : "";
    $new_member = ($_POST["level"] === "new") ? "Y" : "";
}
$status = (empty($_POST["status"])) ? "" : $_POST["status"];

if ($_POST["mode"] == "new") {
    $sql = $db->prepare("INSERT INTO band_members VALUES (?, ?, ?, ?, ?, ?, ?);");
    $sql->bind_param("sssssss", $last, $first, $section, $year, $core, $new_member, $status);
} else if ($_POST["mode"] == "update") {
    $sql = $db->prepare("UPDATE band_members SET last_name = ?, first_name = ?, section = ?, year = ?, core = ?, new_member = ?, status = ? WHERE first_name = ? and last_name = ?;");
    $sql->bind_param("sssssssss", $last, $first, $section, $year, $core, $new_member, $status, $first, $last);
} else if ($_POST["mode"] == "delete") {
    $sql = $db->prepare("DELETE FROM band_members WHERE first_name = ? and last_name = ?;");
    $sql->bind_param("ss", $first, $last);
}

$result = $sql->execute();
$json = array(
    'success' => $result,
);

header('Content-Type: application/json');
echo json_encode($json);

?>
