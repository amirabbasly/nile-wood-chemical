"use client";

export type MathCaptchaChallenge = {
  left: number;
  right: number;
  operator: "+" | "-";
  answer: number;
  question: string;
};

export function createMathCaptcha(): MathCaptchaChallenge {
  const operator = Math.random() > 0.35 ? "+" : "-";
  const first = randomInt(4, 18);
  const second = randomInt(2, 9);
  const left = operator === "-" ? Math.max(first, second) : first;
  const right = operator === "-" ? Math.min(first, second) : second;
  const answer = operator === "+" ? left + right : left - right;

  return {
    left,
    right,
    operator,
    answer,
    question: `${toPersianNumber(left)} ${operator} ${toPersianNumber(right)}`,
  };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toPersianNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(value);
}
