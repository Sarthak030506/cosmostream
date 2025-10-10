'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const FOLLOW_CREATOR = gql`
  mutation FollowCreator($creatorId: ID!) {
    followCreator(creatorId: $creatorId)
  }
`;

const UNFOLLOW_CREATOR = gql`
  mutation UnfollowCreator($creatorId: ID!) {
    unfollowCreator(creatorId: $creatorId)
  }
`;

interface AuthorCardProps {
  author: {
    id: string;
    name: string;
    profile?: {
      avatar?: string;
      bio?: string;
    };
    creatorProfile?: {
      verified: boolean;
      subscriberCount: number;
    };
  };
  isFollowing?: boolean;
}

export function AuthorCard({ author, isFollowing: initialIsFollowing }: AuthorCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);

  const [followCreator] = useMutation(FOLLOW_CREATOR);
  const [unfollowCreator] = useMutation(UNFOLLOW_CREATOR);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      if (isFollowing) {
        await unfollowCreator({ variables: { creatorId: author.id } });
        setIsFollowing(false);
      } else {
        await followCreator({ variables: { creatorId: author.id } });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wide">
        About the Author
      </h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link href={`/profile/${author.id}`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 cursor-pointer hover:scale-105 transition">
            {author.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${author.id}`}>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-white hover:text-cosmos-400 transition">
                {author.name}
              </h4>
              {author.creatorProfile?.verified && (
                <svg
                  className="w-5 h-5 text-cosmos-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </Link>

          {author.creatorProfile && (
            <p className="text-sm text-gray-500 mb-3">
              {author.creatorProfile.subscriberCount.toLocaleString()} followers
            </p>
          )}

          {author.profile?.bio && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{author.profile.bio}</p>
          )}

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            className={`w-full px-4 py-2 rounded-lg font-medium transition ${
              isFollowing
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-cosmos-600 text-white hover:bg-cosmos-500'
            }`}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>
    </div>
  );
}
