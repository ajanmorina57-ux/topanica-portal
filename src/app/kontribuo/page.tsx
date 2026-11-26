import type { Metadata } from "next";
import { PhotoDropzone } from "@/components/PhotoDropzone";

export const metadata: Metadata = { title: "Ndaj me ne" };
export default async function ContributePage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return <div className="page-shell wrap contribute-page"><div className="page-intro"><p className="section-kicker">Për banorët dhe mërgatën</p><h1>Ndaj me ne</h1><p>Një fotografi, një lajm i vogël apo një histori familjare ndihmon ta ruajmë Topanicën bashkë.</p></div>
    {sent === "1" && <p className="success-note" role="status">Faleminderit. Kontributi juaj u dërgua dhe do të shqyrtohet para publikimit.</p>}
    {error && <p className="admin-error" role="alert">{error === "invalid" ? "Kontrolloni të dhënat dhe provoni përsëri." : "Kontributi nuk u ruajt. Provoni përsëri më vonë."}</p>}
    <form className="contribution-form" action="/api/submissions" method="post">
      <label>Emri juaj<input name="sender_name" autoComplete="name" required maxLength={120} /></label>
      <label>Kontakt <span>(opsionale)</span><input name="sender_contact" autoComplete="email" maxLength={240} placeholder="Email ose numër telefoni" /></label>
      <label>Çfarë dëshironi të ndani?<select name="type" required defaultValue="histori"><option value="histori">Histori ose kujtim</option><option value="foto">Fotografi</option><option value="lajm">Lajm ose njoftim</option></select></label>
      <label>Mesazhi juaj<textarea name="message" required minLength={10} maxLength={6000} rows={7} placeholder="Shkruani çfarë dini dhe, nëse mundeni, kur e ku ka ndodhur…" /></label>
      <PhotoDropzone name="image_urls" multiple label="Bashkëngjit fotografi (opsionale)" />
      <label>Lidhja e fotografisë ose burimit <span>(opsionale, nëse fotografia është tashmë online)</span><input name="attachment_url" type="url" maxLength={2000} placeholder="https://" /></label>
      <label className="honeypot" aria-hidden="true">Mos e plotësoni<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="form-note">Kontributi ruhet privatisht për shqyrtim. Nuk publikohet pa miratim.</p><button className="button button-dark" type="submit">Dërgo kontributin <span aria-hidden="true">↗</span></button>
    </form>
  </div>;
}
