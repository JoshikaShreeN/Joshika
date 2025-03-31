import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from './Post';
import { useAuthStore } from '../store/authStore';

interface PostData {
  id: string;
  image_url: string;
  caption: string;
  profiles: {
    username: string;
  };
  likes: number;
  has_liked: boolean;
  has_saved: boolean;
}

const samplePosts: PostData[] = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Exploring the beautiful mountains today! 🏔️ #nature #adventure',
    profiles: {
      username: 'adventurer'
    },
    likes: 156,
    has_liked: false,
    has_saved: false
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1682687221038-404670d5f335',
    caption: 'Coffee and code, perfect morning ☕️ #developer #coding',
    profiles: {
      username: 'techie'
    },
    likes: 89,
    has_liked: false,
    has_saved: false
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1682687220199-d0124f48f95b',
    caption: 'Sunset vibes at the beach 🌅 #sunset #beach #peace',
    profiles: {
      username: 'beachlover'
    },
    likes: 234,
    has_liked: false,
    has_saved: false
  }
];

export function Feed() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // First show sample posts
        setPosts(samplePosts);
        
        // Then fetch real posts from Supabase
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            image_url,
            caption,
            profiles (
              username
            ),
            (
              select count(*) from likes where post_id = posts.id
            ) as likes,
            (
              select count(*) > 0 from likes 
              where post_id = posts.id 
              and user_id = ${user?.id || 'null'}
            ) as has_liked,
            (
              select count(*) > 0 from saved_posts 
              where post_id = posts.id 
              and user_id = ${user?.id || 'null'}
            ) as has_saved
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Combine sample posts with real posts
        if (data && data.length > 0) {
          setPosts([...samplePosts, ...data]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post
          key={post.id}
          id={post.id}
          username={post.profiles.username}
          imageUrl={post.image_url}
          caption={post.caption}
          likes={post.likes}
          hasLiked={post.has_liked}
          hasSaved={post.has_saved}
        />
      ))}
    </div>
  );
}