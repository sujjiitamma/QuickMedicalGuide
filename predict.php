<?php
header("Content-Type: application/json");  // Always return JSON

if (!isset($_GET['symptoms']) || empty($_GET['symptoms'])) {
    echo json_encode(["ok" => false, "error" => "No symptoms provided"]);
    exit;
}

$symptoms = urlencode($_GET['symptoms']);
$flask_url = "http://127.0.0.1:5000/predict?symptoms=" . $symptoms;

// Use cURL instead of file_get_contents (more reliable)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $flask_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200 || $response === false) {
    echo json_encode(["ok" => false, "error" => "Flask server not reachable"]);
    exit;
}

// Decode JSON safely
$data = json_decode($response, true);

if ($data === null) {
    echo json_encode(["ok" => false, "error" => "Invalid JSON received from Flask"]);
} else {
    echo json_encode($data);
}
?>
