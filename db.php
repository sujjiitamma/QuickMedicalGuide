<?php
$host = "127.0.0.1";
$port = 3307; // or your MySQL port
$user = "root";
$pass = "";
$db   = "mdps";
$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    die("DB Connection failed: " . $conn->connect_error);
}
?>