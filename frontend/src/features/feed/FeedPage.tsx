import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { postApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Heart, MessageCircle, Send, Edit2, Trash2 } from "lucide-react";

interface Post {
  _id: string;
  userId: { _id: string; name: string; profileImages: { url: string }[] };
  content: string;
  media: { url: string; mediaType: string }[];
  privacy: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  isEdited: boolean;
  createdAt: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<File[]>([]);
  const { currentUserId } = useAuthStore();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const res = await postApi.getFeed();
      setPosts(res.data.data);
    } catch (err) {
      console.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && media.length === 0) return;

    try {
      const mediaData = await Promise.all(
        media.map(async (file) => {
          const res = await postApi.getPresignedUrl(file.name);
          const { uploadUrl, key } = res.data.data;
          
          await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });
          
          return { url: key, publicId: key, mediaType: 'image' };
        })
      );

      await postApi.createPost({
        content: newPost,
        media: mediaData,
        privacy
      });

      setNewPost("");
      setMedia([]);
      loadFeed();
    } catch (err) {
      console.error("Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postApi.likePost(postId);
      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      ));
    } catch (err) {
      console.error("Failed to like post");
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await postApi.deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post");
    }
  };

  const startEdit = (post: Post) => {
    setEditingPost(post._id);
    setEditContent(post.content);
  };

  const saveEdit = async (postId: string) => {
    try {
      await postApi.updatePost(postId, { content: editContent });
      setPosts(posts.map(p => p._id === postId ? { ...p, content: editContent, isEdited: true } : p));
      setEditingPost(null);
    } catch (err) {
      console.error("Failed to update post");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia([...media, ...Array.from(e.target.files)]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-4 border-b border-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 resize-none outline-none min-h-[80px]"
          />
          {media.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {media.map((file, i) => (
                <div key={i} className="relative">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setMedia(media.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                📷
              </Button>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2 py-1 text-sm text-slate-300"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
            </div>
            <Button type="submit" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </form>
      </div>

      <div className="divide-y divide-border">
        {posts.map((post) => (
          <div key={post._id} className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.userId?.profileImages?.[0]?.url} />
                <AvatarFallback>{post.userId?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{post.userId?.name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                    {post.isEdited && " (edited)"}
                  </span>
                </div>
                {editingPost === post._id ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg p-2 text-slate-200"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(post._id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-slate-300">{post.content}</p>
                )}
                {post.media && post.media.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
                    {post.media.map((m, i) => (
                      <img key={i} src={m.url} alt="" className="w-full object-cover aspect-square" />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1 text-sm ${post.isLiked ? "text-red-500" : "text-slate-500"}`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                      {post.likesCount}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-slate-500">
                      <MessageCircle className="w-5 h-5" />
                      {post.commentsCount}
                    </button>
                  </div>
                  {post.userId?._id === currentUserId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="text-slate-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-slate-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No posts yet. Follow users or add friends to see their posts!
          </div>
        )}
      </div>
    </div>
  );
}