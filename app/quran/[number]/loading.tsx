// Loading state for surah detail page
// Shows while surah data is being fetched

export default function SurahLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* Loading spinner */}
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-xl font-semibold mb-2">Loading Surah</h2>
          <p className="text-gray-400 text-sm">Fetching ayahs...</p>
        </div>
      </div>
    </div>
  );
}
