from typing import Optional

from google import genai
from google.genai import types

from app.core.config import settings

SYSTEM_PROMPT = """You are Iris, the friendly AI assistant for Eye To Eye Opticians,
a premium optical retail shop in Sri Lanka.

Your role:
- Help customers find the right spectacles, sunglasses, and contact lenses
- Explain different lens types: Frame Only, Single Vision, Bifocal, Crizal,
  Polarized, and daily/monthly contact lens packs
- Explain frame shapes: Round, Square, Rectangle, Aviator, Cat-Eye, Oval
- Help customers understand their prescription (SPH, CYL, AXIS, ADD, PD)
- Recommend booking an eye test if a customer mentions vision problems
- Explain the Virtual Try-On feature and the loyalty points programme
- All prices are in Sri Lankan Rupees (LKR)

Store policies:
- Free delivery on orders over LKR 5,000 (LKR 350 delivery fee otherwise)
- Eye tests are available by appointment
- Payment is collected in-store — no online payment required at checkout

Rules:
- Only answer questions related to eyewear, optical products, and eye health
- Do not provide medical diagnoses — for eye health concerns, recommend
  booking an eye test or seeing a doctor
- Never invent specific product names, prices, or stock availability —
  point customers to the shop pages to check current stock and pricing
- Be friendly, concise, and helpful — keep responses under 150 words
  unless the customer asks for more detail
- Respond in the same language the customer writes in
- You are Iris — never say you are Gemini or any other AI"""


def _build_customer_context(customer_context: Optional[dict]) -> str:
    if not customer_context:
        return ""

    lines = ["\n\n=== CURRENT CUSTOMER CONTEXT ==="]

    if customer_context.get("customer_name"):
        lines.append(f"Customer name: {customer_context['customer_name']}")

    if customer_context.get("loyalty_balance") is not None:
        balance = customer_context["loyalty_balance"]
        lines.append(f"Loyalty points balance: {balance} points")

    prescription = customer_context.get("active_prescription")
    if prescription:
        right = prescription.get("right_eye", {})
        left = prescription.get("left_eye", {})
        recommended = prescription.get("recommended_lens_types") or []
        lines.append(
            "Active prescription on file — "
            f"Right eye: SPH {right.get('sph') or '—'}, "
            f"CYL {right.get('cyl') or '—'}, "
            f"AXIS {right.get('axis') or '—'}. "
            f"Left eye: SPH {left.get('sph') or '—'}, "
            f"CYL {left.get('cyl') or '—'}, "
            f"AXIS {left.get('axis') or '—'}. "
            f"Recommended lens type: {', '.join(recommended) if recommended else 'not determined'}"
        )

    recent_order = customer_context.get("recent_order")
    if recent_order:
        lines.append(
            f"Most recent order: {recent_order.get('order_reference')} — "
            f"status: {recent_order.get('status')} — "
            f"total: LKR {recent_order.get('total', 0):,.2f}"
        )

    lines.append("=================================")
    return "\n".join(lines)


def get_chat_response(
    messages: list[dict[str, str]],
    customer_context: Optional[dict] = None,
) -> str:
    """Send a conversation to Gemini and return Iris's reply.

    messages: list of {"role": "user"|"assistant", "content": "..."} —
    the last message must be from the user.
    """
    if not settings.GOOGLE_API_KEY:
        raise ValueError(
            "GOOGLE_API_KEY not set in .env — please add your Gemini API key"
        )

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    history = [
        types.Content(
            role="model" if message["role"] == "assistant" else "user",
            parts=[types.Part(text=message["content"])],
        )
        for message in messages[:-1]
    ]

    chat = client.chats.create(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + _build_customer_context(customer_context),
            temperature=0.7,
            max_output_tokens=500,
            top_p=0.95,
        ),
        history=history,
    )

    response = chat.send_message(messages[-1]["content"])
    return response.text
