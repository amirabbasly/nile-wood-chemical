"use client";

type PaymentInput = {
  amount: number;
  orderId: string;
  description: string;
  mobile?: string;
};

export async function startZarinpalPayment(input: PaymentInput) {
  const merchantId = process.env.NEXT_PUBLIC_ZARINPAL_MERCHANT_ID;
  const callbackUrl = process.env.NEXT_PUBLIC_ZARINPAL_CALLBACK_URL;

  if (!merchantId || !callbackUrl) {
    throw new Error("Merchant ID یا Callback URL زرین‌پال تنظیم نشده است.");
  }

  const response = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: input.amount,
      callback_url: `${callbackUrl}?order_id=${input.orderId}`,
      description: input.description,
      metadata: input.mobile ? { mobile: input.mobile } : undefined,
    }),
  });

  const result = await response.json();
  const authority = result?.data?.authority;
  if (!authority) {
    throw new Error(result?.errors?.message || "امکان شروع پرداخت وجود ندارد.");
  }

  window.location.href = `https://www.zarinpal.com/pg/StartPay/${authority}`;
}
