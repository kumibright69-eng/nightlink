import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-wrap">
      <div className="empty-state">
        <span className="eyebrow">A LITTLE OFF THE PATH</span>
        <h1>
          This chapter
          <br />
          isn’t here.
        </h1>
        <p>
          The page you’re looking for may have moved. Your next connection is
          still waiting to be found.
        </p>
        <Link className="button primary" href="/">
          Back to Akoma
        </Link>
      </div>
    </main>
  );
}
