import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
export const metadata = { title: "Hyrja në administrim" };
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return <div className="login-wrap"><Link href="/" className="wordmark"><Image className="wordmark-logo" src="/logo.png" alt="" width={396} height={331} /><span className="brand-copy"><strong>TOPANICA</strong></span></Link><h1>Hyrje për administrim</h1><p>Menaxhoni lajmet, historinë, galerinë dhe kontributet e komunitetit.</p>{error && <p className="admin-error" role="alert">{error === "config" ? "Konfigurimi i sesionit mungon. Kontrolloni SESSION_SECRET." : "Fjalëkalimi nuk është i saktë."}</p>}<form action="/api/admin/login" method="post"><input className="sr-only" type="text" name="username" autoComplete="username" value="admin" readOnly tabIndex={-1} aria-hidden="true" /><label>Fjalëkalimi<input type="password" name="password" autoComplete="current-password" required /></label><button className="button button-dark" type="submit">Hyr në panel</button></form><Link className="back-link" href="/">← Kthehu te faqja</Link></div>;
}
