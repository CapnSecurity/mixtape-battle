import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6">🎵</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Mixtape Battle
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Head-to-head song ranking for your band. Vote on your favorite tracks and watch them climb the leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/battle"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105"
            >
              ⚔️ Start Battling
            </Link>
            <Link
              href="/results"
              className="inline-block bg-white hover:bg-gray-100 text-purple-700 font-bold py-4 px-8 rounded-lg text-lg transition"
            >
              🏆 View Rankings
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-8 text-center hover:bg-opacity-20 transition">
            <div className="text-5xl mb-4">⚔️</div>
            <h3 className="text-xl font-bold text-white mb-2">Battle Songs</h3>
            <p className="text-gray-300">
              Compare two songs and vote for your favorite. Every vote counts!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-8 text-center hover:bg-opacity-20 transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Rankings</h3>
            <p className="text-gray-300">
              Uses ELO ratings to fairly rank songs based on community votes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-8 text-center hover:bg-opacity-20 transition">
            <div className="text-5xl mb-4">🎼</div>
            <h3 className="text-xl font-bold text-white mb-2">Your Collection</h3>
            <p className="text-gray-300">
              Manage and organize all your band's songs in one place.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to rank your music?
          </h2>
          <p className="text-purple-100 mb-8">
            Sign in to start voting and see which songs your band loves the most.
          </p>
          <Link
            href="/battle"
            className="inline-block bg-white hover:bg-gray-100 text-purple-700 font-bold py-3 px-8 rounded-lg transition"
          >
            Battle Now
          </Link>
        </div>
      </div>
    </div>
  );
}
