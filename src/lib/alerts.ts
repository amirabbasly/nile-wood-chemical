"use client";

import Swal from "sweetalert2";

export function showErrorAlert(text: string, title = "خطا") {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "متوجه شدم",
    confirmButtonColor: "#168447",
    customClass: {
      popup: "swal-rtl",
    },
  });
}

export function showSuccessAlert(text: string, title = "انجام شد") {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "باشه",
    confirmButtonColor: "#168447",
    customClass: {
      popup: "swal-rtl",
    },
  });
}
