"use client";

import { useState } from "react";
import { showAdminToast } from "@/components/AdminToast";

export function AdminControls({ initialAutoPublish }: { initialAutoPublish: boolean }) {
  const [enabled, setEnabled] = useState(initialAutoPublish);
  const [working, setWorking] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  async function toggle() {
    setWorking(true);
    setError("");
    try {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ auto_publish_news: !enabled }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEnabled(data.auto_publish_news);
      showAdminToast(data.auto_publish_news ? "Publikimi automatik u aktivizua." : "Ruajtja si draft u aktivizua.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Nuk u ruajt cilësimi.";
      setError(message);
      showAdminToast(message, "error");
    } finally {
      setWorking(false);
    }
  }

  async function scrape() {
    setWorking(true);
    setReport("");
    setError("");
    try {
      const response = await fetch("/api/admin/scrape", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kontrolli i burimeve dështoi.");
      setReport(
        `U kontrolluan ${data.checked}, u shtuan ${data.inserted}, u anashkaluan ${data.skipped}, gabime ${data.errors}.`,
      );
      showAdminToast("Kontrolli i burimeve përfundoi.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Kontrolli i burimeve dështoi.";
      setError(message);
      showAdminToast(message, "error");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="admin-controls">
      <div className="admin-mode">
        <div>
          <strong>{enabled ? "Publikimi automatik aktiv" : "Radha e drafteve aktive"}</strong>
          <p>
            {enabled
              ? "Lajmet relevante publikohen sapo përpunohen."
              : "Lajmet e reja ruhen si draft për shqyrtim."}
          </p>
        </div>
        <button
          type="button"
          className={enabled ? "toggle on" : "toggle"}
          role="switch"
          aria-label="Publikimi automatik"
          aria-checked={enabled}
          disabled={working}
          onClick={toggle}
        >
          <span />
        </button>
      </div>
      <button type="button" className="button button-dark" onClick={scrape} disabled={working}>
        {working ? "Duke kontrolluar burimet…" : "Kontrollo burimet tani"}
      </button>
      {report && (
        <p role="status" className="admin-result">
          {report}
        </p>
      )}
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
    </div>
  );
}
