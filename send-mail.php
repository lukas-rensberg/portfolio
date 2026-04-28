<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

$siteEmail = "contact@lukas-rensberg.de";

switch ($_SERVER['REQUEST_METHOD']) {
    case 'OPTIONS':
        http_response_code(200);
        exit;

    case 'POST':

        $whitelist = ['127.0.0.1', '::1'];

        if (in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
            $json = file_get_contents('php://input');
            $params = json_decode($json);

            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
                exit;
            }

            $email = $params->email ?? '';
            $name = $params->name ?? '';
            $userMessage = $params->message ?? '';

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || empty($name) || empty($userMessage)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid input data']);
                exit;
            }

            $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
            $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
            $safeMessage = nl2br(htmlspecialchars($userMessage, ENT_QUOTES, 'UTF-8'));

            $recipient = "lukas@lukas-rensberg.de";
            $subject = 'Portfolio: Contact Request';

            $mailBody = "
                <strong>Name:</strong> {$safeName}<br>
                <strong>Email:</strong> {$safeEmail}<br><br>
                <strong>Message:</strong><br>
                {$safeMessage}
            ";

            $headers = [];
            $headers[] = 'MIME-Version: 1.0';
            $headers[] = 'Content-type: text/html; charset=utf-8';
            $headers[] = 'From: Contact Form Portfolio <' . $siteEmail . '>';
            $headers[] = 'Reply-To: ' . $email;
            $headers[] = 'Return-Path: ' . $siteEmail;

            $success = mail(
                $recipient,
                $subject,
                $mailBody,
                implode("\r\n", $headers),
                '-f ' . $siteEmail
            );

            if ($success) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Mail delivery failed']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Permission denied!' ]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Permission denied!']);
        exit;
}