import Link from "next/link";
export default function NotFound() {
  return <div className="not-found"><p className="section-kicker">Faqja nuk u gjet</p><h1>Kjo faqe nuk është këtu.</h1><p>Adresa mund të jetë ndryshuar ose lidhja nuk është e saktë.</p><Link className="button button-dark" href="/">Kthehu në ballinë ↗</Link></div>;
}
