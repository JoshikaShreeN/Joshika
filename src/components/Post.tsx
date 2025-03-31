import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface PostProps {
  id: string;
  username: string;
  imageUrl: string;
  caption: string;
  likes: number;
  hasLiked: boolean;
  hasSaved: boolean;
}

export function Post({ id, username, imageUrl, caption, likes: initialLikes, hasLiked: initialHasLiked, hasSaved: initialHasSaved }: PostProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [hasSaved, setHasSaved] = useState(initialHasSaved);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuthStore();

  const handleLike = async () => {
    if (!user) return;

    try {
      if (hasLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: id, user_id: user.id });
        setLikes(prev => prev - 1);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: id, user_id: user.id });
        setLikes(prev => prev + 1);
      }
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      if (hasSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .match({ post_id: id, user_id: user.id });
      } else {
        await supabase
          .from('saved_posts')
          .insert({ post_id: id, user_id: user.id });
      }
      setHasSaved(!hasSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      await supabase
        .from('comments')
        .insert({
          post_id: id,
          user_id: user.id,
          content: comment.trim()
        });
      setComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${username}`,
        text: caption,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="post-gradient rounded-xl shadow-lg mb-6 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <div className="p-4 border-b border-gray-200/50 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
          {username[0].toUpperCase()}
        </div>
        <div className="font-semibold text-gray-800">{username}</div>
      </div>
      
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="Post" 
          className="w-full object-cover max-h-[600px]"
          onDoubleClick={handleLike}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`interaction-button ${hasLiked ? 'active text-red-500' : 'text-gray-700'}`}
            >
              <Heart className={`transform transition-transform ${hasLiked ? 'scale-110 fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="interaction-button text-gray-700"
            >
              <MessageCircle />
            </button>
            <button 
              onClick={handleShare}
              className="interaction-button text-gray-700"
            >
              <Share2 />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`interaction-button ${hasSaved ? 'active text-blue-500' : 'text-gray-700'}`}
          >
            <Bookmark className={hasSaved ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="mb-2 font-semibold text-gray-800">
          {likes.toLocaleString()} likes
        </div>
        
        <div className="mb-4 text-gray-800">
          <span className="font-semibold mr-2">{username}</span>
          {caption}
        </div>

        {showComments && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Comments will appear here...</div>
          </div>
        )}

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} /> Post
          </button>
        </form>
      </div>
    </div>
  );
}