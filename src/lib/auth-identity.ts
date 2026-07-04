"use client";

const usernameDomain = "nilewoodchemicals.local";

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(value: string) {
  return value.includes("@");
}

export function authEmailFromIdentifier(value: string) {
  const identifier = normalizeUsername(value);
  return isEmailIdentifier(identifier) ? identifier : `${identifier}@${usernameDomain}`;
}

export function validateUsername(value: string) {
  const username = normalizeUsername(value);
  return /^[a-z0-9._-]{3,32}$/.test(username);
}
