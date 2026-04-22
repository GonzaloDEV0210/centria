<?php
// Configuración para devolver JSON
header('Content-Type: application/json; charset=utf-8');

// Incluir las clases de PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// Solo procesar si es una petición POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 1. Recibir y sanitizar los datos
    $name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $whatsapp = isset($_POST['whatsapp']) ? strip_tags(trim($_POST['whatsapp'])) : '';
    $message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

    // 2. Validación básica en backend
    if (empty($name) || empty($email) || empty($whatsapp) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos inválidos."]);
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // 3. Configuración del sistema de envío (Función Mail nativa del servidor)
        // Usamos isMail() porque el servidor bloquea las conexiones SMTP externas
        $mail->isMail();                                            

        // 4. Remitente y Destinatario
        $mail->setFrom('notiweb@centriaperu.com', 'CENTRIA Web');
        
        // Correo al que llegarán los mensajes del formulario
        $mail->addAddress('correoprueba@colegiolacatolica.edu.pe', 'Contacto CENTRIA'); 
        $mail->addReplyTo($email, $name);

        // 5. Contenido del correo
        $mail->isHTML(true);                                        
        $mail->Subject = 'Nuevo mensaje de contacto Web - ' . $name;
        $mail->CharSet = 'UTF-8';

        $htmlContent = '
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7d4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                .header { background-color: #88b7bf; padding: 30px 25px; text-align: center; color: #ffffff; border-bottom: 4px solid #6a9ba3; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; }
                .content { padding: 35px 30px; color: #2f4a4f; line-height: 1.6; }
                .greeting { font-size: 16px; margin-bottom: 25px; }
                .field { margin-bottom: 22px; }
                .label { font-weight: 700; color: #6a9ba3; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px; }
                .value { font-size: 16px; background-color: #fbfedf; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #88b7bf; font-weight: 500; }
                .message-box { background-color: #f9fafb; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-line; margin-top: 6px; font-size: 15px; color: #4a5568; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                .btn-wa { display: inline-block; background: #25d366; color: #fff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; margin-top: 4px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Nuevo Contacto desde la Web</h1>
                </div>
                <div class="content">
                    <p class="greeting">Hola, has recibido una nueva solicitud de contacto a través del formulario web de <strong>CENTRIA</strong>.</p>
                    
                    <div class="field">
                        <span class="label">Nombre completo</span>
                        <div class="value">' . htmlspecialchars($name) . '</div>
                    </div>
                    
                    <div class="field">
                        <span class="label">Correo electrónico</span>
                        <div class="value"><a href="mailto:' . htmlspecialchars($email) . '" style="color: #2f4a4f; text-decoration: none;">' . htmlspecialchars($email) . '</a></div>
                    </div>
                    
                    <div class="field">
                        <span class="label">Teléfono / WhatsApp</span>
                        <div class="value">
                            ' . htmlspecialchars($whatsapp) . '<br>
                            <a href="https://wa.me/51' . htmlspecialchars($whatsapp) . '" class="btn-wa">Chat en WhatsApp</a>
                        </div>
                    </div>
                    
                    <div class="field">
                        <span class="label">Mensaje</span>
                        <div class="message-box">' . htmlspecialchars($message) . '</div>
                    </div>
                </div>
                <div class="footer">
                    Este correo electrónico fue enviado a través del sitio web de CENTRIA usando SMTP seguro.<br>
                    Si presionas "Responder", tu mensaje se enviará directamente al cliente (<strong>' . htmlspecialchars($email) . '</strong>).
                </div>
            </div>
        </body>
        </html>';

        $mail->Body    = $htmlContent;
        // Versión en texto plano para clientes de correo que no soportan HTML
        $mail->AltBody = "Nuevo mensaje de contacto Web - CENTRIA\n\nNombre: $name\nCorreo: $email\nWhatsApp: $whatsapp\nMensaje:\n$message";

        $mail->send();
        echo json_encode(["status" => "success", "message" => "Correo enviado correctamente."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Ocurrió un error al enviar el correo."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido. Usa POST."]);
}
?>
