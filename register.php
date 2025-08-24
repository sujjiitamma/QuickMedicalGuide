<?php
include "db.php";

$name     = $_POST['name'];
$email    = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$location = $_POST['location'];

$stmt = $conn->prepare("INSERT INTO users1 (name, email, password, location) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $password, $location);

try {
    $stmt->execute();
    echo "success";
} 
catch (mysqli_sql_exception $e) {
    if (strpos($e->getMessage(), 'Duplicate') !== false) {
        echo "exists";
    } else {
        echo "error: " . $e->getMessage();
    }
}
?>