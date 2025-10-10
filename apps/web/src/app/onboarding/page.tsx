'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { SET_ASTRONOMY_LEVEL } from '@/graphql/content';

const ASTRONOMY_LEVELS = [
  {
    value: 'BEGINNER',
    title: 'Beginner',
    emoji: '🌟',
    description: 'Just starting to explore the cosmos',
    details: 'Perfect for those new to astronomy and space science',
  },
  {
    value: 'INTERMEDIATE',
    title: 'Intermediate',
    emoji: '🔭',
    description: 'Familiar with basic astronomy concepts',
    details: 'You understand planets, stars, and basic celestial mechanics',
  },
  {
    value: 'ADVANCED',
    title: 'Advanced',
    emoji: '🚀',
    description: 'Deep knowledge of astrophysics',
    details: 'You grasp complex topics like relativity and cosmology',
  },
  {
    value: 'EXPERT',
    title: 'Expert',
    emoji: '🌌',
    description: 'Professional or academic level',
    details: 'Research-level understanding of astronomy and astrophysics',
  },
];

const INTEREST_OPTIONS = [
  'Solar System',
  'Exoplanets',
  'Stars & Stellar Evolution',
  'Galaxies',
  'Black Holes',
  'Cosmology',
  'Space Missions',
  'Astrophotography',
  'Observational Astronomy',
  'Astrobiology',
  'Space Technology',
  'Physics & Mathematics',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [setAstronomyLevel, { loading }] = useMutation(SET_ASTRONOMY_LEVEL);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    if (!selectedLevel) return;

    try {
      await setAstronomyLevel({
        variables: {
          level: selectedLevel,
          interests: selectedInterests,
          preferredTopics: selectedInterests,
        },
      });

      // Redirect to discover page
      router.push('/discover');
    } catch (error) {
      console.error('Error saving astronomy profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to CosmoStream</h1>
          <p className="text-xl text-gray-400">
            Let's personalize your astronomy learning experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div
            className={`w-3 h-3 rounded-full transition ${
              step >= 1 ? 'bg-cosmos-500' : 'bg-gray-700'
            }`}
          ></div>
          <div
            className={`w-3 h-3 rounded-full transition ${
              step >= 2 ? 'bg-cosmos-500' : 'bg-gray-700'
            }`}
          ></div>
        </div>

        {/* Step 1: Astronomy Level */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                What's your astronomy knowledge level?
              </h2>
              <p className="text-gray-400">
                This helps us recommend content that matches your expertise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ASTRONOMY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedLevel === level.value
                      ? 'border-cosmos-500 bg-cosmos-500/10 shadow-lg shadow-cosmos-500/20'
                      : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                  }`}
                >
                  <div className="text-4xl mb-3">{level.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{level.title}</h3>
                  <p className="text-cosmos-300 mb-2">{level.description}</p>
                  <p className="text-sm text-gray-500">{level.details}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedLevel}
                className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                What topics interest you most?
              </h2>
              <p className="text-gray-400">Select all that apply (optional)</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedInterests.includes(interest)
                      ? 'border-nebula-500 bg-nebula-500/10'
                      : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                  }`}
                >
                  <span
                    className={`font-medium ${
                      selectedInterests.includes(interest)
                        ? 'text-nebula-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {interest}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="bg-cosmos-600 hover:bg-cosmos-500 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Setup 🚀'}
              </button>
            </div>

            {selectedInterests.length === 0 && (
              <p className="text-center text-gray-500 text-sm">
                Skip this step if you'd like to explore all topics
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
