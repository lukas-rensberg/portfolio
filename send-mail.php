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

        $whitelist = ['127.0.0.1', '0:0:0:0:0:0:0:1'];

        if (in_array($_SERVER['REMOTE_ADDR'], $whitelist)) {
            $json = file_get_contents('php://input');
            $params = json_decode($json);

            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON', 'json_error' => json_last_error(), 'params' => $json]);
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

            $headersUserInfo = [];
            $headersUserInfo[] = 'MIME-Version: 1.0';
            $headersUserInfo[] = 'Content-type: text/html; charset=utf-8';
            $headersUserInfo[] = 'From: Contact Form Portfolio <' . $siteEmail . '>';
            $headersUserInfo[] = 'Reply-To: ' . $siteEmail;
            $headersUserInfo[] = 'Return-Path: ' . $siteEmail;

            $subjectUserInfo = 'Thank You for Contacting Me';

            $mailBodyUserInfo = "
<p><strong>--- Deutsche Version unten ---</strong></p>

<p>Hi,</p>

<p>Thank you for your inquiry. I have received your message.</p>

<p>I am currently reviewing your request and will get back to you within <strong>24–48 business hours</strong>.</p>

<p>Thank you for your patience.</p>

<p>Kind regards,<br>
Lukas Rensberg</p>

<hr>

<p><strong>--- Deutsche Version ---</strong></p>

<p>Hallo,</p>

<p>vielen Dank für deine Anfrage. Ich habe deine Nachricht erhalten.</p>

<p>Ich prüfe dein Anliegen derzeit und werde mich innerhalb von <strong>1-2 Werktagen</strong> bei dir zurückmelden.</p>

<p>Vielen Dank für deine Geduld.</p>

<p>Mit freundlichen Grüßen<br>
Lukas Rensberg</p>
            ";

            $userInfoSuccess = mail(
                $email,
                $subjectUserInfo,
                $mailBodyUserInfo,
                implode("\r\n", $headersUserInfo),
                '-f ' . $siteEmail
            );



            if ($success && $userInfoSuccess) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, '$success' => $success, '$userInfoSuccess' => $userInfoSuccess, 'error' => 'Mail delivery failed']);
            }
        } else {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Permission denied!', 'ip' => $_SERVER['REMOTE_ADDR'] ]);
        }

        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Permission denied!']);
        exit;
}