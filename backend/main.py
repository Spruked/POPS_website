from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_local_env() -> None:
  for env_path in (REPO_ROOT / ".env", REPO_ROOT / ".env.local"):
    if not env_path.exists():
      continue

    for raw_line in env_path.read_text(
      encoding="utf-8",
      errors="ignore",
    ).splitlines():
      line = raw_line.strip()

      if not line or line.startswith("#") or "=" not in line:
        continue

      key, value = line.split("=", 1)
      key = key.strip()
      value = value.strip().strip('"').strip("'")

      if key:
        os.environ[key] = value


_load_local_env()

app = FastAPI(title="POPS Website API")


class CheckoutItem(BaseModel):
  id: str
  quantity: int = 1


class SquareCheckoutRequest(BaseModel):
  items: list[CheckoutItem]
  name: str = ""
  email: str = ""
  note: str = ""


class SquarePaymentRequest(SquareCheckoutRequest):
  source_id: str
  verification_token: str = ""


PRODUCT_CATALOG: dict[str, dict[str, Any]] = {
  "guardian-intro": {
    "name": "Guardian Access",
    "price_cents": 9900,
  },
  "guardian": {
    "name": "Guardian Beta Tester Access",
    "price_cents": 5500,
  },
  "sponsor": {
    "name": "Sponsor a Father",
    "price_cents": 2500,
  },
  "membership": {
    "name": "POPS Membership",
    "price_cents": 1299,
  },
}


def _square_api_base() -> str:
  environment = os.getenv(
    "SQUARE_ENVIRONMENT",
    "production",
  ).strip().lower()

  if environment == "sandbox":
    return "https://connect.squareupsandbox.com"

  return "https://connect.squareup.com"


def _square_environment() -> str:
  environment = os.getenv(
    "SQUARE_ENVIRONMENT",
    "production",
  ).strip().lower()

  return "sandbox" if environment == "sandbox" else "production"


def _square_credentials() -> dict[str, str]:
  return {
    "access_token": os.getenv("SQUARE_ACCESS_TOKEN", "").strip(),
    "application_id": os.getenv("SQUARE_APPLICATION_ID", "").strip(),
    "location_id": os.getenv("SQUARE_LOCATION_ID", "").strip(),
    "version": os.getenv("SQUARE_VERSION", "2026-07-15").strip(),
  }


def _square_headers(credentials: dict[str, str]) -> dict[str, str]:
  return {
    "Authorization": f"Bearer {credentials['access_token']}",
    "Square-Version": credentials["version"],
    "Content-Type": "application/json",
  }


def _paypal_environment() -> str:
  environment = os.getenv(
    "PAYPAL_ENVIRONMENT",
    "sandbox",
  ).strip().lower()

  return "production" if environment in {"production", "live"} else "sandbox"


def _paypal_api_base() -> str:
  if _paypal_environment() == "production":
    return "https://api-m.paypal.com"

  return "https://api-m.sandbox.paypal.com"


def _paypal_credentials() -> dict[str, str]:
  environment = _paypal_environment()

  if environment == "production":
    client_id = (
      os.getenv("PAYPAL_LIVE_CLIENT_ID", "")
      or os.getenv("PAYPAL_CLIENT_ID", "")
      or os.getenv("PAYPAL_API_CLIENT_ID", "")
    )
    client_secret = (
      os.getenv("PAYPAL_LIVE_CLIENT_SECRET", "")
      or os.getenv("PAYPAL_CLIENT_SECRET", "")
      or os.getenv("PAYPAL_API_SECRET", "")
      or os.getenv("PAYPAL_SECRET", "")
    )
  else:
    client_id = (
      os.getenv("PAYPAL_SANDBOX_CLIENT_ID", "")
      or os.getenv("PAYPAL_CLIENT_ID", "")
      or os.getenv("PAYPAL_API_CLIENT_ID", "")
    )
    client_secret = (
      os.getenv("PAYPAL_SANDBOX_CLIENT_SECRET", "")
      or os.getenv("PAYPAL_CLIENT_SECRET", "")
      or os.getenv("PAYPAL_API_SECRET", "")
      or os.getenv("PAYPAL_SECRET", "")
    )

  return {
    "client_id": client_id.strip(),
    "client_secret": client_secret.strip(),
  }


def _validated_square_line_items(
  items: list[CheckoutItem],
) -> list[dict[str, Any]]:
  line_items: list[dict[str, Any]] = []

  for item in items:
    product = PRODUCT_CATALOG.get(item.id)

    if not product:
      continue

    quantity = max(1, min(int(item.quantity), 99))

    line_items.append({
      "name": product["name"],
      "quantity": str(quantity),
      "base_price_money": {
        "amount": product["price_cents"],
        "currency": "USD",
      },
    })

  if not line_items:
    raise HTTPException(
      status_code=400,
      detail="No valid checkout items were provided.",
    )

  return line_items


def _validated_catalog_items(items: list[CheckoutItem]) -> list[dict[str, Any]]:
  catalog_items: list[dict[str, Any]] = []

  for item in items:
    product = PRODUCT_CATALOG.get(item.id)

    if not product:
      continue

    catalog_items.append({
      "id": item.id,
      "name": product["name"],
      "quantity": max(1, min(int(item.quantity), 99)),
      "price_cents": int(product["price_cents"]),
    })

  if not catalog_items:
    raise HTTPException(
      status_code=400,
      detail="No valid checkout items were provided.",
    )

  return catalog_items


def _square_order_total_cents(line_items: list[dict[str, Any]]) -> int:
  return sum(
    int(item["base_price_money"]["amount"]) * int(item["quantity"])
    for item in line_items
  )


def _catalog_total_cents(catalog_items: list[dict[str, Any]]) -> int:
  return sum(
    int(item["price_cents"]) * int(item["quantity"])
    for item in catalog_items
  )


def _money_value(cents: int) -> str:
  return f"{cents / 100:.2f}"


def _payment_note(request: SquareCheckoutRequest) -> str:
  note_parts = ["POPS website checkout"]

  if request.name.strip():
    note_parts.append(f"Name: {request.name.strip()}")

  if request.email.strip():
    note_parts.append(f"Email: {request.email.strip()}")

  if request.note.strip():
    note_parts.append(f"Note: {request.note.strip()}")

  return " | ".join(note_parts)[:500]


async def _paypal_access_token() -> str:
  credentials = _paypal_credentials()

  if not credentials["client_id"] or not credentials["client_secret"]:
    raise HTTPException(
      status_code=503,
      detail=(
        "PayPal checkout is not configured. "
        "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
      ),
    )

  try:
    async with httpx.AsyncClient(timeout=30) as client:
      response = await client.post(
        f"{_paypal_api_base()}/v1/oauth2/token",
        auth=(credentials["client_id"], credentials["client_secret"]),
        data={"grant_type": "client_credentials"},
        headers={
          "Accept": "application/json",
          "Accept-Language": "en_US",
        },
      )
  except Exception as exc:
    raise HTTPException(
      status_code=502,
      detail=f"PayPal authentication failed: {exc}",
    ) from exc

  if response.status_code >= 400:
    raise _paypal_http_exception(response, "PayPal authentication failed.")

  token = response.json().get("access_token")

  if not token:
    raise HTTPException(
      status_code=502,
      detail="PayPal did not return an access token.",
    )

  return str(token)


@app.get("/api/checkout/square/config")
async def square_checkout_config() -> dict[str, str]:
  credentials = _square_credentials()

  if not credentials["application_id"] or not credentials["location_id"]:
    raise HTTPException(
      status_code=503,
      detail=(
        "Square checkout is not configured. "
        "Set SQUARE_APPLICATION_ID and SQUARE_LOCATION_ID."
      ),
    )

  return {
    "application_id": credentials["application_id"],
    "location_id": credentials["location_id"],
    "environment": _square_environment(),
  }


@app.get("/api/checkout/paypal/config")
async def paypal_checkout_config() -> dict[str, str]:
  credentials = _paypal_credentials()

  if not credentials["client_id"]:
    raise HTTPException(
      status_code=503,
      detail="PayPal checkout is not configured. Set PAYPAL_CLIENT_ID.",
    )

  return {
    "client_id": credentials["client_id"],
    "environment": _paypal_environment(),
  }


@app.post("/api/checkout/paypal/orders")
async def create_paypal_order(
  request: SquareCheckoutRequest,
) -> dict[str, Any]:
  catalog_items = _validated_catalog_items(request.items)
  total_cents = _catalog_total_cents(catalog_items)
  access_token = await _paypal_access_token()

  payload = {
    "intent": "CAPTURE",
    "purchase_units": [
      {
        "description": "POPS website order",
        "custom_id": _payment_note(request),
        "items": [
          {
            "name": item["name"],
            "quantity": str(item["quantity"]),
            "category": "DIGITAL_GOODS",
            "unit_amount": {
              "currency_code": "USD",
              "value": _money_value(item["price_cents"]),
            },
          }
          for item in catalog_items
        ],
        "amount": {
          "currency_code": "USD",
          "value": _money_value(total_cents),
          "breakdown": {
            "item_total": {
              "currency_code": "USD",
              "value": _money_value(total_cents),
            },
          },
        },
      },
    ],
    "application_context": {
      "brand_name": "POPS",
      "shipping_preference": "NO_SHIPPING",
      "user_action": "PAY_NOW",
    },
  }

  try:
    async with httpx.AsyncClient(timeout=30) as client:
      response = await client.post(
        f"{_paypal_api_base()}/v2/checkout/orders",
        headers={
          "Authorization": f"Bearer {access_token}",
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        json=payload,
      )
  except Exception as exc:
    raise HTTPException(
      status_code=502,
      detail=f"PayPal order creation failed: {exc}",
    ) from exc

  if response.status_code >= 400:
    raise _paypal_http_exception(response, "PayPal order creation failed.")

  paypal_payload = response.json()
  order_id = paypal_payload.get("id")

  if not order_id:
    raise HTTPException(
      status_code=502,
      detail="PayPal did not return an order ID.",
    )

  return {
    "order_id": order_id,
    "status": paypal_payload.get("status"),
  }


@app.post("/api/checkout/paypal/orders/{order_id}/capture")
async def capture_paypal_order(order_id: str) -> dict[str, Any]:
  if not order_id.strip():
    raise HTTPException(
      status_code=400,
      detail="PayPal order ID is required.",
    )

  access_token = await _paypal_access_token()

  try:
    async with httpx.AsyncClient(timeout=30) as client:
      response = await client.post(
        f"{_paypal_api_base()}/v2/checkout/orders/{order_id}/capture",
        headers={
          "Authorization": f"Bearer {access_token}",
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
      )
  except Exception as exc:
    raise HTTPException(
      status_code=502,
      detail=f"PayPal capture failed: {exc}",
    ) from exc

  if response.status_code >= 400:
    raise _paypal_http_exception(response, "PayPal capture failed.")

  paypal_payload = response.json()
  capture = (
    (paypal_payload.get("purchase_units") or [{}])[0]
    .get("payments", {})
    .get("captures", [{}])[0]
  )

  return {
    "order_id": paypal_payload.get("id"),
    "status": paypal_payload.get("status"),
    "capture_id": capture.get("id"),
    "capture_status": capture.get("status"),
  }


@app.post("/api/checkout/square/payment")
async def create_square_payment(
  request: SquarePaymentRequest,
) -> dict[str, Any]:
  credentials = _square_credentials()

  if not credentials["access_token"] or not credentials["location_id"]:
    raise HTTPException(
      status_code=503,
      detail=(
        "Square checkout is not configured. "
        "Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID."
      ),
    )

  source_id = request.source_id.strip()

  if not source_id:
    raise HTTPException(
      status_code=400,
      detail="Square did not return a payment token.",
    )

  line_items = _validated_square_line_items(request.items)
  amount_cents = _square_order_total_cents(line_items)
  note = _payment_note(request)

  try:
    async with httpx.AsyncClient(timeout=30) as client:
      order_response = await client.post(
        f"{_square_api_base()}/v2/orders",
        headers=_square_headers(credentials),
        json={
          "idempotency_key": str(uuid.uuid4()),
          "order": {
            "location_id": credentials["location_id"],
            "source": {
              "name": "POPS Website",
            },
            "line_items": line_items,
          },
        },
      )

      if order_response.status_code >= 400:
        raise _square_http_exception(order_response, "Square order creation failed.")

      order_payload = order_response.json()
      order_id = (order_payload.get("order") or {}).get("id")

      if not order_id:
        raise HTTPException(
          status_code=502,
          detail="Square did not return an order ID.",
        )

      payment_payload: dict[str, Any] = {
        "idempotency_key": str(uuid.uuid4()),
        "source_id": source_id,
        "location_id": credentials["location_id"],
        "order_id": order_id,
        "amount_money": {
          "amount": amount_cents,
          "currency": "USD",
        },
        "autocomplete": True,
        "note": note,
      }

      if request.email.strip():
        payment_payload["buyer_email_address"] = request.email.strip()

      if request.verification_token.strip():
        payment_payload["verification_token"] = request.verification_token.strip()

      payment_response = await client.post(
        f"{_square_api_base()}/v2/payments",
        headers=_square_headers(credentials),
        json=payment_payload,
      )
  except HTTPException:
    raise
  except Exception as exc:
    raise HTTPException(
      status_code=502,
      detail=f"Square payment request failed: {exc}",
    ) from exc

  if payment_response.status_code >= 400:
    raise _square_http_exception(payment_response, "Square payment failed.")

  square_payload = payment_response.json()
  payment = square_payload.get("payment") or {}

  return {
    "payment_id": payment.get("id"),
    "order_id": payment.get("order_id"),
    "status": payment.get("status"),
    "receipt_url": payment.get("receipt_url"),
  }


def _square_http_exception(
  response: httpx.Response,
  fallback_detail: str,
) -> HTTPException:
  detail = fallback_detail

  try:
    square_payload = response.json()

    if square_payload.get("errors"):
      first_error = square_payload["errors"][0]
      detail = (
        first_error.get("detail")
        or first_error.get("code")
        or detail
      )
  except ValueError:
    detail = response.text or detail

  return HTTPException(
    status_code=response.status_code,
    detail=detail,
  )


def _paypal_http_exception(
  response: httpx.Response,
  fallback_detail: str,
) -> HTTPException:
  detail = fallback_detail

  try:
    paypal_payload = response.json()
    details = paypal_payload.get("details")

    if isinstance(details, list) and details:
      detail = details[0].get("description") or details[0].get("issue") or detail
    else:
      detail = paypal_payload.get("message") or paypal_payload.get("name") or detail
  except ValueError:
    detail = response.text or detail

  return HTTPException(
    status_code=response.status_code,
    detail=detail,
  )
