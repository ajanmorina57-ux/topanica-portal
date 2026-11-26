import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="section-kicker">Gabim 404</p>
      <h1>Kjo faqe nuk u gjet.</h1>
      <p>Adresa mund të jetë ndryshuar ose lidhja nuk është e saktë.</p>
      <Link className="button button-dark" href="/">
        Kthehu në ballinë <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
