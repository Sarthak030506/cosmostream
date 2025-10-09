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
    <section className="border-t border-gray-800 bg-gray-900 py-16">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Why CosmoStream?</h2>
          <p className="mt-4 text-lg text-gray-400">
            More than just a video platform - your complete astronomy learning ecosystem
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="card hover:ring-cosmos-500 transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
