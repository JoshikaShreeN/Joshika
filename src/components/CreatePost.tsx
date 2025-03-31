import React, { useState } from 'react';
import { ImagePlus, Loader, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !user) return;

    try {
      setLoading(true);

      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: imageData, error: imageError } = await supabase.storage
        .from('posts')
        .upload(fileName, image);

      if (imageError) throw imageError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption,
          image_url: publicUrl
        });

      if (postError) throw postError;

      setCaption('');
      setImage(null);
      setPreview(null);
      if (e.target instanceof HTMLFormElement) {
        e.target.reset();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-gradient rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-lg border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            placeholder="Write a caption..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg p-4 hover:border-purple-500 bg-gray-50/50 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
                required
              />
              <div className="space-y-2 text-center">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  Click to upload an image
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </div>
              </div>
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !image}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={18} /> Creating Post...
            </>
          ) : (
            'Share Post'
          )}
        </button>
      </form>
    </div>
  );
}