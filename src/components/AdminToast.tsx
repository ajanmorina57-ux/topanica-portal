"use client";

import { useEffect, useState } from "react";

type Toast = { message: string; kind: "success" | "error" };
const notices: Record<string, string> = {
  saved: "U ruajt.", published: "Artikulli u publikua.", deleted: "U fshi.",
  approved: "Kontributi u miratua.", rejected: "Kontributi u refuzua.", converted: "Kontributi u kthye në përmbajtje draft.",
};

export function showAdminToast(message: string, kind: Toast["kind"] = "success") {
  window.dispatchEvent(new CustomEvent<Toast>("topanica:admin-toast", { detail: { message, kind } }));
}

export function AdminToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = (next: Toast) => {
      setToast(next);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3600);
    };
    const onToast = (event: Event) => show((event as CustomEvent<Toast>).detail);
    window.addEventListener("topanica:admin-toast", onToast);
    const params = new URLSearchParams(window.location.search);
    const notice = params.get("notice");
    if (notice && notices[notice]) {
      show({ message: notices[notice], kind: "success" });
      params.delete("notice");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
    return () => {
      window.removeEventListener("topanica:admin-toast", onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return <div className={`admin-toast ${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>{toast.message}</div>;
}
