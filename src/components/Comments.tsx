"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentsProps {
  songId: number;
}

export default function Comments({ songId }: CommentsProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/songs/${songId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [songId]);

  // Submit new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/songs/${songId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
      }
    } catch (err) {
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/api/songs/${songId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (err) {
      alert("Failed to delete comment. Please try again.");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl shadow-[var(--shadow)] p-8 border border-[var(--ring)]/20">
      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {status === "authenticated" ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this song..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--ring)]/20 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pink)] resize-none"
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-[var(--muted)]">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-6 py-2 bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </form>
      ) : (
        <div className="mb-8 p-4 bg-[var(--bg)] rounded-xl border border-[var(--ring)]/20 text-center">
          <p className="text-[var(--muted)]">
            <Link
              href="/login"
              className="text-[var(--pink)] hover:underline font-semibold"
            >
              Sign in
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-[var(--muted)]">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted)]">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--ring)]/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {comment.user.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-sm">
                      {(comment.user.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-[var(--text)]">
                      {comment.user.name || "Anonymous"}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                {session?.user?.id === comment.user.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-500 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-[var(--text)] whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
