'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { VideoUploader } from '@/components/upload/VideoUploader';
import { GET_CATEGORIES } from '@/graphql/content';
import { gql } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
      id
      role
    }
  }
`;

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<'metadata' | 'upload' | 'complete'>('metadata');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    tags: '',
  });
  const [_uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  const { data: userData, loading: userLoading } = useQuery(GET_ME);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES, {
    variables: { limit: 100 },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMetadataSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a video title');
      return;
    }

    setStep('upload');
  };

  const handleUploadComplete = (videoId: string) => {
    setUploadedVideoId(videoId);
    setStep('complete');
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Error is displayed in the VideoUploader component
  };

  const handleUploadAnother = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      tags: '',
    });
    setUploadedVideoId(null);
    setStep('metadata');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    );
  }

  if (!userData?.me) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">
            Share your astronomy and space content with the CosmoStream community. All users can upload!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  step === 'metadata'
                    ? 'bg-cosmos-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                1
              </div>
              <span
                className={`font-medium ${
                  step === 'metadata' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Video Details
              </span>
            </div>

            <div className="flex-1 h-0.5 bg-gray-800"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  step === 'upload'
                    ? 'bg-cosmos-600 text-white'
                    : step === 'complete'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {step === 'complete' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  '2'
                )}
              </div>
              <span
                className={`font-medium ${
                  step === 'upload' || step === 'complete' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Upload File
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Metadata Form */}
        {step === 'metadata' && (
          <form onSubmit={handleMetadataSubmit} className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              {/* Title */}
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Video Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Journey Through the Cosmos: Black Holes Explained"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Tell viewers what your video is about..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  {categoriesLoading ? (
                    <div className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400">
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                    >
                      <option value="">Select a category...</option>
                      {categoriesData?.categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.iconEmoji} {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Difficulty */}
                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="astronomy, black holes, cosmology (separate with commas)"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Add relevant tags to help users discover your video
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold rounded-lg transition duration-200 flex items-center gap-2"
              >
                <span>Continue to Upload</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Upload File */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">Upload Your Video</h2>
              <p className="text-gray-400 mb-6">
                Video: <span className="text-white font-medium">{formData.title}</span>
              </p>

              <VideoUploader
                initialMetadata={{
                  title: formData.title,
                  description: formData.description,
                  tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
                  category: formData.category || undefined,
                  difficulty: formData.difficulty || undefined,
                }}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('metadata')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Back to Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Video Uploaded Successfully!</h2>
              <p className="text-lg text-gray-300 mb-8">
                Your video is now being processed. This may take a few minutes depending on the file size.
                You'll receive a notification when it's ready to view.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push(`/dashboard/videos`)}
                  className="px-8 py-3 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold rounded-lg transition duration-200"
                >
                  Go to My Videos
                </button>
                <button
                  onClick={handleUploadAnother}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                >
                  Upload Another Video
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">What happens next?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cosmos-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Your video is being transcoded into multiple resolutions (1080p, 720p, 480p) for optimal playback</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cosmos-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>A thumbnail will be automatically generated, or you can upload a custom one</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cosmos-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>You'll receive an in-app notification and email when processing is complete</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-cosmos-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Once ready, your video will be publicly accessible and discoverable on the platform</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
