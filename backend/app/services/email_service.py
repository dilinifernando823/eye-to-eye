import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.order import Order

logger = logging.getLogger(__name__)


def _send_email(to_email: str, subject: str, html_body: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.SMTP_USER
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, message.as_string())


def send_order_confirmation(to_email: str, order: "Order") -> None:
    try:
        items_html = "".join(
            f"<li>{item.quantity} x {item.variant.product.name} "
            f"({item.variant.lens_type or 'Standard'}) — LKR {item.unit_price:,.2f}</li>"
            for item in order.items
        )
        html_body = f"""
        <h2>Thank you for your order!</h2>
        <p>Order Reference: <strong>{order.order_reference}</strong></p>
        <ul>{items_html}</ul>
        <p>Total: <strong>LKR {order.total:,.2f}</strong></p>
        <p>Delivery Address: {order.delivery_address}, {order.delivery_city}</p>
        <p>We will process your order shortly.</p>
        """
        subject = f"Order Confirmed — {order.order_reference} | Eye To Eye Opticians"
        _send_email(to_email, subject, html_body)
    except Exception:
        logger.exception("Failed to send order confirmation email")


def send_appointment_confirmation(to_email: str, appointment: "Appointment") -> None:
    try:
        html_body = f"""
        <h2>Your appointment is confirmed!</h2>
        <p>Date: <strong>{appointment.appointment_date}</strong></p>
        <p>Time: <strong>{appointment.appointment_time}</strong></p>
        <p>Status: {appointment.status}</p>
        <p>Eye To Eye Opticians</p>
        <p>Please bring your current glasses and/or prescription with you.</p>
        """
        subject = "Appointment Confirmed | Eye To Eye Opticians"
        _send_email(to_email, subject, html_body)
    except Exception:
        logger.exception("Failed to send appointment confirmation email")
