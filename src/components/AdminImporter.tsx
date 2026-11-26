"use client";

import { useState } from "react";
import { showAdminToast } from "@/components/AdminToast";

export type ImportedArticle = {
  title: string;
  summary: string;
  body: string;
  category: "topanice" | "komuna" | "zhvillim" | "mergata";
  cover_url?: string;
  source_name: string;
  source_url: string;
  source_type: "manual" | "facebook_import" | "tavily";
};

export function AdminImporter() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceType, setSourceType] = useState<"manual" | "facebook_import">("manual");
  const [text, setText] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function formatWithAi() {
    setWorking(true);
    setError("");
    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source_url: sourceUrl, source_name: sourceName, source_type: sourceType, text }),
      });
      const data = (await response.json()) as { article?: ImportedArticle; error?: string };
      if (!response.ok || !data.article) throw new Error(data.error || "Formatimi dështoi.");
      window.dispatchEvent(new CustomEvent<ImportedArticle>("topanica:article-import", { detail: data.article }));
      showAdminToast("Përmbajtja u formatua dhe u vendos në redaktor.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Formatimi dështoi.";
      setError(message);
      showAdminToast(message, "error");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="admin-form-block importer-panel" aria-labelledby="importer-title">
      <div className="importer-heading">
        <div>
          <p className="section-kicker">Facebook, njoftime dhe artikuj</p>
          <h3 id="importer-title">Përgatit artikullin</h3>
          <p>
            Ngjisni tekstin e një postimi ose lidhjen e një artikulli. Për lidhje kërkohet Tavily; postimet mund të
            ngjiten direkt.
          </p>
        </div>
        <span className="importer-index">01 / 02</span>
      </div>
      <div className="admin-form importer-form">
        <label>
          Lidhja e artikullit (opsionale)
          <input
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://…"
          />
        </label>
        <label>
          Emri i burimit (opsional)
          <input
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            placeholder="p.sh. Shoqata Topanica"
          />
        </label>
        <label>
          Lloji i burimit
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as "manual" | "facebook_import")}
          >
            <option value="manual">Tekst i ngjitur / tjetër</option>
            <option value="facebook_import">Postim nga Facebook</option>
          </select>
        </label>
        <label className="importer-text">
          Teksti i postimit ose njoftimit
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            placeholder="Ngjisni këtu tekstin nga Facebook, shkolla, xhamia, KEDS-i ose një njoftim tjetër"
          />
        </label>
        {error && (
          <p className="admin-error importer-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="button button-dark"
          onClick={formatWithAi}
          disabled={working || (!sourceUrl.trim() && text.trim().length < 30)}
        >
          {working ? "Duke përgatitur…" : "Formato me AI"}
        </button>
      </div>
    </section>
  );
}
