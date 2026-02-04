import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
              Mixtape
            </h1>
            <p className="text-2xl text-gray-600 mb-2">
              Collaborate. Battle. Choose.
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Vote on submitted songs and help the band decide which tracks make the setlist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/songs" 
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Browse Songs
              </Link>
              <Link 
                href="/battle" 
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Start Battling
              </Link>
              <Link 
                href="/results" 
                className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8">
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Battle</h3>
              <p className="text-gray-600">
                Vote on pairs of songs. Simple head-to-head matchups.
              </p>
            </div>

            <div className="p-8">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Learn</h3>
              <p className="text-gray-600">
                Guitar tabs, bass tabs, lyrics, and videos for every song.
              </p>
            </div>

            <div className="p-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Rank</h3>
              <p className="text-gray-600">
                Watch songs climb the rankings based on votes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
