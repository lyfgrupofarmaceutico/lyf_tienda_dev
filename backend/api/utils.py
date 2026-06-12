from rest_framework.views import exception_handler
from django.core.mail import EmailMessage
from .models import User, OneTimePassword
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed
import random
import logging

logger = logging.getLogger(__name__)


# Generar codigo OTP
def generateOtp():
    otp = ""
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp


# Enviar codigo OTP por correo
def send_code_to_user(email):
    otp_code = generateOtp()
    user = User.objects.get(email=email)
    OneTimePassword.objects.filter(user=user).delete()
    OneTimePassword.objects.create(user=user, code=otp_code)

    subject = "✨ Verificación de cuenta"
    from_email = settings.DEFAULT_FROM_EMAIL

    # Texto plano por si el html falla
    text_content = f"Tu código de verificación es: {otp_code}"

    # Plantilla verification.html
    html_content = render_to_string("emails/verification.html", {"otp": otp_code})

    msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


# Enviar link para recuperacion de contraseña
def send_password_reset_email(user, abslink):
    subject = "🔐 Cambio de contraseña"
    from_email = settings.DEFAULT_FROM_EMAIL

    # Texto plano por si el html falla
    text_content = f"Has solicitado recuperar o cambiar tu contraseña en L&F Grupo Farmacéutico. Tu link de recuperación es::\n{abslink}"

    # Plantilla password-reset.html
    html_content = render_to_string(
        "emails/password-reset.html", {"user": user, "reset_link": abslink}
    )

    msg = EmailMultiAlternatives(subject, text_content, from_email, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()


def send_contact_email(data: dict) -> None:
    from_email = settings.DEFAULT_FROM_EMAIL
    client_email = data["email"]
    sales_email = getattr(settings, "EMAIL_SALES_LYF", None)

    # Validación básica del email del cliente
    if not client_email or "@" not in client_email:
        logger.error(f"❌ Email del cliente inválido: {client_email}")
        return

    # ==========================================
    # 1. CORREO DE CONFIRMACIÓN AL CLIENTE
    # ==========================================
    try:
        msg_client = EmailMultiAlternatives(
            subject="Hemos recibido tu mensaje | L&F Grupo Farmacéutico",
            body=(
                f"Hola {data['fullname']},\n\n"
                f"Gracias por contactar a L&F Grupo Farmacéutico. "
                f"Hemos recibido tu mensaje sobre: {data['reason']}\n"
                f"Nos pondremos en contacto contigo lo más pronto posible."
            ),
            from_email=from_email,
            to=[client_email],
            reply_to=[from_email],
        )
        msg_client.attach_alternative(
            render_to_string(
                "emails/contact-client.html",
                {
                    "fullname": data["fullname"],
                    "reason": data["reason"],
                },
            ),
            "text/html",
        )
        msg_client.send()
        logger.info(f"✅ Confirmación enviada a {client_email}")

    except Exception as e:
        logger.error(
            f"❌ Fallo al enviar correo al cliente {client_email}: {e}", exc_info=True
        )

    # ==========================================
    # 2. CORREO DE NOTIFICACIÓN A VENTAS
    # ==========================================
    if sales_email:
        try:
            msg_sales = EmailMultiAlternatives(
                subject=f"Nuevo contacto: {data['reason']}: {data['fullname']}",
                body=(
                    f"Nuevo mensaje desde el formulario de contacto:\n\n"
                    f"• Nombre: {data.get('fullname')}\n"
                    f"• Teléfono: {data.get('phone')}\n"
                    f"• Ciudad: {data.get('city')}\n"
                    f"• Email: {data.get('email')}\n"
                    f"• Motivo: {data.get('reason')}\n"
                    f"• Mensaje: {data.get('message')}\n"
                ),
                from_email=from_email,
                to=[sales_email],
                reply_to=[
                    client_email
                ],  # Ventas podrá responder directamente al cliente
            )
            msg_sales.attach_alternative(
                render_to_string("emails/contact-sales.html", data), "text/html"
            )
            msg_sales.send()
            logger.info(f"✅ Notificación enviada a ventas ({sales_email})")

        except Exception as e:
            logger.error(
                f"❌ Fallo al enviar correo a ventas {sales_email}: {e}", exc_info=True
            )
    else:
        logger.warning(
            "⚠️ EMAIL_SALES_LYF no configurado en settings.py. Omitiendo correo a ventas."
        )
