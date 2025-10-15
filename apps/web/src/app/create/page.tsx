'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { MarkdownEditor } from '@/components/content/MarkdownEditor';
import { GET_CATEGORIES, CREATE_CONTENT_ITEM } from '@/graphql/content';
import { gql } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
      id
      role
    }
  }
`;

export default function CreateContentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bodyMarkdown: '',
    categoryId: '',
    contentType: 'ARTICLE',
    difficultyLevel: 'BEGINNER',
    ageGroup: 'ALL',
    tags: '',
  });

  const { data: userData } = useQuery(GET_ME);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES, {
    variables: { limit: 100 },
  });

  const [createContent, { loading: creating }] = useMutation(CREATE_CONTENT_ITEM, {
    onCompleted: (data) => {
      router.push(`/content/${data.createContentItem.id}`);
    },
    onError: (error) => {
      console.error('Error creating content:', error);
      alert('Failed to create content. Please try again.');
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.bodyMarkdown || !formData.categoryId) {
      alert('Please fill in all required fields (Title, Content, Category)');
      return;
    }

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    try {
      await createContent({
        variables: {
          input: {
            title: formData.title,
            description: formData.description || null,
            bodyMarkdown: formData.bodyMarkdown,
            categoryId: formData.categoryId,
            contentType: formData.contentType,
            difficultyLevel: formData.difficultyLevel,
            ageGroup: formData.ageGroup,
            tags,
          },
        },
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!userData?.me) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Content</h1>
          <p className="text-gray-400">
            Share your knowledge about space and astronomy with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Understanding Black Holes for Beginners"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief summary of your content (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Content Type, Difficulty, Age Group */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Content Type */}
            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-300 mb-2">
                Content Type <span className="text-red-400">*</span>
              </label>
              <select
                id="contentType"
                value={formData.contentType}
                onChange={(e) => handleChange('contentType', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                required
              >
                <option value="ARTICLE">Article</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="GUIDE">Guide</option>
                <option value="NEWS">News</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label
                htmlFor="difficultyLevel"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Difficulty Level <span className="text-red-400">*</span>
              </label>
              <select
                id="difficultyLevel"
                value={formData.difficultyLevel}
                onChange={(e) => handleChange('difficultyLevel', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                required
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-300 mb-2">
                Age Group <span className="text-red-400">*</span>
              </label>
              <select
                id="ageGroup"
                value={formData.ageGroup}
                onChange={(e) => handleChange('ageGroup', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                required
              >
                <option value="ALL">All Ages</option>
                <option value="KIDS">Kids (6-12)</option>
                <option value="TEENS">Teens (13-17)</option>
                <option value="ADULTS">Adults (18+)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            {categoriesLoading ? (
              <div className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400">
                Loading categories...
              </div>
            ) : (
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                required
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
              placeholder="Separate tags with commas (e.g., cosmology, physics, space)"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add relevant tags to help users discover your content
            </p>
          </div>

          {/* Markdown Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <MarkdownEditor
              value={formData.bodyMarkdown}
              onChange={(value) => handleChange('bodyMarkdown', value)}
              placeholder="# Start writing your content here...

Use **Markdown** to format your content. You can add:
- Headings
- **Bold** and *italic* text
- Code blocks
- Images
- Links
- Lists
- And more!

Switch to Preview tab to see how it looks."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-8 py-3 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Publish Content
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">📚 Writing Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Use clear, descriptive titles that accurately represent your content</li>
            <li>• Break up long paragraphs with headings and bullet points for readability</li>
            <li>• Include images and diagrams to illustrate complex concepts</li>
            <li>• Add code examples with syntax highlighting for technical tutorials</li>
            <li>• Choose accurate difficulty levels to help readers find appropriate content</li>
            <li>• Use relevant tags to improve discoverability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
