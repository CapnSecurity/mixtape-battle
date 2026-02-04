import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Mixtape Battle</h1>
      <p>Welcome — head-to-head song ranking for your band.</p>
      <nav>
        <ul>
          <li>
            <Link href="/battle">Battle</Link>
          </li>
          <li>
            <Link href="/results">Results</Link>
          </li>
          <li>
            <Link href="/songs">Songs</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
