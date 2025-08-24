<?php
include "db.php";

$email = $_POST['email'];

$stmt = $conn->prepare("SELECT * FROM users2 WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 1) {
  header("Location: reset.php?email=" . urlencode($email));
  exit();
} else {
  echo "Email not found.";
}
?>
