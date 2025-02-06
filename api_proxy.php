<?php

// **Hugging Face Configuration:**
$huggingface_api_token = 'YOUR_HUGGING_FACE_API_TOKEN'; // Replace with your actual token
$huggingface_model = 'google/flan-t5-xxl'; // Or any other suitable model

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['messages']) || !is_array($data['messages']) || empty($data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: "messages" array is missing or empty']);
    exit;
}

$messages = $data['messages'];
$prompt = "";

// Format messages for flan-t5-xxl (example - adapt as needed for your model)
foreach ($messages as $message) {
    $prompt .= $message['role'] . ": " . $message['content'] . "\n";
}

// **Hugging Face API Call:**
$url = "https://api-inference.huggingface.co/models/" . $huggingface_model;

$headers = [
    "Authorization: Bearer " . $huggingface_api_token,
    "Content-Type: application/json"
];

$request_data = [
    "inputs" => $prompt, // Send the formatted prompt
    // Add any other model-specific parameters here if needed (e.g., temperature, max_length)
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    error_log("cURL Error: " . curl_error($ch));
}

curl_close($ch);

// **Handle Hugging Face Response:**
if ($http_status >= 200 && $http_status < 300) {
    $response_data = json_decode($response, true);

    // Extract the generated text (adapt based on the model's output format)
    if (isset($response_data['generated_text'])) {
        $generated_text = $response_data['generated_text'];
    } else if (is_array($response_data) && isset($response_data[0]['generated_text'])) {
        $generated_text = $response_data[0]['generated_text'];
    }
    else if (isset($response_data[0]['generated_text'])){
        $generated_text = $response_data[0]['generated_text'];
    }
     else {
        error_log("Unexpected Hugging Face response format: " . $response);
        http_response_code(500);
        echo json_encode(['error' => 'Unexpected response from Hugging Face API']);
        exit;
    }

    echo json_encode(['choices' => [['message' => ['content' => $generated_text]]]]); // Reformat to match OpenAI response structure

} else {
    error_log("Hugging Face API Error: Status Code: " . $http_status . ", Response: " . $response);
    http_response_code(502);
    echo json_encode(['error' => 'Error communicating with Hugging Face API', 'huggingface_status' => $http_status, 'huggingface_response' => json_decode($response, true)]);
}

?>
