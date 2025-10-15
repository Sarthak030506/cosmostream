const features = [
  {
    title: 'Real-Time Mission Tracking',
    description:
      'Follow live space missions with telemetry data, countdown timers, and interactive Q&A during launches.',
    icon: '🚀',
  },
  {
    title: 'Expert Community',
    description:
      'Join forums moderated by credentialed astrophysicists. Ask questions and get verified answers.',
    icon: '👨‍🔬',
  },
  {
    title: 'Virtual Planetarium',
    description:
      'Immersive 360° video experiences and AR-enabled sky maps for mobile devices.',
    icon: '🌌',
  },
  {
    title: 'Educational Tools',
    description:
      'Interactive quizzes, note-taking with timestamp linking, and curated learning paths.',
    icon: '📚',
  },
  {
    title: 'Creator Monetization',
    description:
      'Support your favorite creators through subscriptions and direct contributions.',
    icon: '💰',
  },
  {
    title: 'Institutional Access',
    description:
      'Bulk licensing for universities and schools with LMS integration via LTI.',
    icon: '🏫',
  },
];

export function Features() {
  return (
    <section className="relative border-t border-gray-800/30 py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 4px 16px rgba(0, 0, 0, 0.9)' }}>
            Why CosmoStream?
          </h2>
          <p className="mt-4 text-lg text-gray-300 drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)' }}>
            More than just a video platform - your complete astronomy learning ecosystem
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-gray-900/85 to-gray-950/85 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-cosmos-400/50 hover:shadow-cosmos-500/30"
            >
              {/* Dark overlay for readability */}
              <div className="pointer-events-none absolute inset-0 bg-black/20" />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 text-4xl drop-shadow-lg">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white drop-shadow-md">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-200 drop-shadow-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
