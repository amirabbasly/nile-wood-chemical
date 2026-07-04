"use client";

import { RefreshCcw } from "lucide-react";
import type { MathCaptchaChallenge } from "@/lib/math-captcha";

export function MathCaptcha({
  challenge,
  value,
  onChange,
  onRefresh,
}: {
  challenge: MathCaptchaChallenge;
  value: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="math-captcha">
      <div>
        <span>اعتبارسنجی امنیتی</span>
        <strong>{challenge.question} = ?</strong>
      </div>
      <input
        required
        inputMode="numeric"
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="answer"
      />
      <button type="button" onClick={onRefresh} aria-label="سؤال جدید">
        <RefreshCcw size={18} />
      </button>
    </div>
  );
}
