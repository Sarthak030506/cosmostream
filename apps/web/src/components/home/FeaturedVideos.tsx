'use client';

export function FeaturedVideos() {
  // Placeholder data - will be replaced with GraphQL query
  const videos = [
    {
      id: '1',
      title: 'Journey Through the Cosmos: Black Holes Explained',
      creator: 'Dr. Jane Smith',
      thumbnail: 'https://placehold.co/600x400/1e1b4b/6366f1?text=Black+Holes',
      duration: '24:15',
      views: 125000,
    },
    {
      id: '2',
      title: 'Live: James Webb Space Telescope Latest Discoveries',
      creator: 'NASA Official',
      thumbnail: 'https://placehold.co/600x400/1e1b4b/d946ef?text=JWST',
      duration: '45:32',
      views: 89000,
    },
    {
      id: '3',
      title: 'Understanding Dark Matter and Dark Energy',
      creator: 'Prof. Alan Chen',
      thumbnail: 'https://placehold.co/600x400/1e1b4b/6366f1?text=Dark+Matter',
      duration: '18:47',
      views: 67000,
    },
    {
      id: '4',
      title: 'Exoplanet Hunting: How We Find Other Worlds',
      creator: 'Dr. Maria Rodriguez',
      thumbnail: 'https://placehold.co/600x400/1e1b4b/d946ef?text=Exoplanets',
      duration: '31:20',
      views: 54000,
    },
  ];

  return (
    <section className="relative py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 4px 16px rgba(0, 0, 0, 0.9)' }}>
            Featured Content
          </h2>
          <a href="/browse" className="text-sm text-cosmos-400 drop-shadow-md hover:text-cosmos-300">
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`/watch/${video.id}`}
              className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cosmos-400/50 hover:shadow-xl hover:shadow-cosmos-500/20"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-2 font-semibold group-hover:text-cosmos-400">
                  {video.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{video.creator}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {video.views.toLocaleString()} views
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
