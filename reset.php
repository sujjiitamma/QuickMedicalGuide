<?php
include "db.php";

// Handle the POST request to reset password
if ($_SERVER['REQUEST_METHOD'] == 'POST') 
  {
  $email = $_POST['email'];
  $newpass = password_hash($_POST['newpass'], PASSWORD_DEFAULT);

  $stmt = $conn->prepare("UPDATE users2 SET password=? WHERE email=?");
  $stmt->bind_param("ss", $newpass, $email);

  if ($stmt->execute()) {
    echo "<div style='
      background: url(\"/prooo/background.png\") no-repeat center center fixed;
      background-size: cover;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial;
      color: white;'>
      <div style='background: rgba(0,0,0,0.5); padding: 30px; border-radius:10px; text-align:center;'>
        <h2>Password reset successful.</h2>
        <a href='signup.html' style='
          display:inline-block;
          margin-top:15px;
          padding:10px 20px;
          background:#002147;
          color:white;
          text-decoration:none;
          border-radius:5px;'>Login Now</a>
      </div>
    </div>";
  } else {
    echo "Reset failed.";
  }
  exit();
}

// Show the reset form
$email = $_GET['email'];
?>

<!DOCTYPE html>
<html>
<head>
  <title>Reset Password</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: url('/prooo/background.png') no-repeat center center fixed;
      background-size: cover;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .reset-container {
      background: rgba(0,0,0,0.5);
      padding: 30px;
      border-radius: 10px;
      text-align: center;
    }
    input[type="password"] {
      padding: 10px;
      width: 100%;
      margin-bottom: 15px;
      border: none;
      border-radius: 5px;
    }
    button {
      padding: 10px 20px;
      background: #002147;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #003366;
    }
  </style>
</head>
<body>
  <div class="reset-container">
    <h2>Reset Password</h2>
    <form method="POST" action="reset.php">
      <input type="hidden" name="email" value="<?php echo htmlspecialchars($email); ?>">
      <input type="password" name="newpass" placeholder="Enter new password" required><br>
      <button type="submit">Reset Password</button>
    </form>
  </div>
</body>
</html>
