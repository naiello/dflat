<?php
$config = read_ini_file('../../secret/db.ini');
$db = new mysqli($config['dbserver'], $config['dbuser'], $config['dbpass'], $config['dbname']);

if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

?>
