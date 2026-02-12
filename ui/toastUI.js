//ui/toastUI.js

const toast = document.getElementById("toast");

export function showToast(message, type = "info") {
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast toast-visible";
  if (type === "error") toast.classList.add("toast-error");
  if (type === "success") toast.classList.add("toast-success");
  setTimeout(() => {
    toast.classList.remove("toast-visible");
  }, 1800);
}