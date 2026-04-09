"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle, Star, PenLine } from "lucide-react";
import { Review, ReviewReply, mockReviews } from "@/data/mockReviews";

// ─── Rating Summary Bar ───
function RatingSummary() {
  const totalReviews = mockReviews.length;
  const avgRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  // Mock distribution
  const distribution = [
    { stars: 5, count: Math.round(totalReviews * 0.7) },
    { stars: 4, count: Math.round(totalReviews * 0.2) },
    { stars: 3, count: Math.round(totalReviews * 0.07) },
    { stars: 2, count: Math.round(totalReviews * 0.03) },
    { stars: 1, count: 0 },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
      {/* Left: Big score */}
      <div className="flex flex-col items-center min-w-[140px]">
        <span className="text-5xl font-extrabold text-white">{avgRating.toFixed(1)}</span>
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
          ))}
        </div>
        <span className="text-xs text-slate-500 mt-1">{totalReviews} ulasan</span>
      </div>

      {/* Right: Distribution bars */}
      <div className="flex-1 w-full space-y-2">
        {distribution.map((d) => {
          const pct = totalReviews > 0 ? (d.count / totalReviews) * 100 : 0;
          return (
            <div key={d.stars} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-4 text-right font-medium">{d.stars}</span>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 w-8 text-right">{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Single Reply Component ───
function ReplyItem({ reply }: { reply: ReviewReply }) {
  const [votes, setVotes] = useState({ up: reply.upvotes, down: reply.downvotes });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const handleVote = (dir: "up" | "down") => {
    if (voted === dir) {
      setVoted(null);
      setVotes((v) => ({ ...v, [dir]: v[dir] - 1 }));
    } else {
      if (voted) setVotes((v) => ({ ...v, [voted]: v[voted] - 1 }));
      setVoted(dir);
      setVotes((v) => ({ ...v, [dir]: v[dir] + 1 }));
    }
  };

  const renderContent = (text: string) => {
    const mentionRegex = /@([\w\s.]+?)(?=\s|$|,|\.)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span key={i} className="text-emerald-400 font-semibold cursor-pointer hover:underline">@{part}</span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex gap-3 ml-12 mt-4">
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 border border-slate-600">
        {reply.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-white">{reply.author}</span>
          {reply.isBadged && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              {reply.isBadged}
            </span>
          )}
          <span className="text-xs text-slate-500">{reply.date}</span>
        </div>
        <p className="text-sm text-slate-300 mt-1 leading-relaxed">{renderContent(reply.content)}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <button onClick={() => handleVote("up")} className={`p-1 rounded-md transition-colors ${voted === "up" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}>
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className={`text-xs font-medium min-w-[16px] text-center ${votes.up - votes.down > 0 ? "text-emerald-400" : votes.up - votes.down < 0 ? "text-rose-400" : "text-slate-500"}`}>
              {votes.up - votes.down}
            </span>
            <button onClick={() => handleVote("down")} className={`p-1 rounded-md transition-colors ${voted === "down" ? "text-rose-400 bg-rose-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium">Reply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Review Component ───
function ReviewItem({ review }: { review: Review }) {
  const [votes, setVotes] = useState({ up: review.upvotes, down: review.downvotes });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showReplies, setShowReplies] = useState(true);

  const handleVote = (dir: "up" | "down") => {
    if (voted === dir) {
      setVoted(null);
      setVotes((v) => ({ ...v, [dir]: v[dir] - 1 }));
    } else {
      if (voted) setVotes((v) => ({ ...v, [voted]: v[voted] - 1 }));
      setVoted(dir);
      setVotes((v) => ({ ...v, [dir]: v[dir] + 1 }));
    }
  };

  return (
    <div className="py-6 border-b border-slate-800 last:border-none">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-slate-200 flex-shrink-0 border border-slate-600">
          {review.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-white">{review.author}</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500">{review.date}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
            ))}
          </div>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">{review.content}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <button onClick={() => handleVote("up")} className={`p-1 rounded-md transition-colors ${voted === "up" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}>
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className={`text-xs font-medium min-w-[16px] text-center ${votes.up - votes.down > 0 ? "text-emerald-400" : votes.up - votes.down < 0 ? "text-rose-400" : "text-slate-500"}`}>
                {votes.up - votes.down}
              </span>
              <button onClick={() => handleVote("down")} className={`p-1 rounded-md transition-colors ${voted === "down" ? "text-rose-400 bg-rose-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <button className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> Reply
            </button>
            {review.replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-semibold">
                {showReplies ? "Sembunyikan" : `Lihat ${review.replies.length} balasan`}
              </button>
            )}
          </div>
          {showReplies && review.replies.length > 0 && (
            <div className="border-l-2 border-slate-800 ml-1 mt-2">
              {review.replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Review Section ───
export default function ReviewSection({ lapanganName }: { lapanganName: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Community Reviews</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{mockReviews.length} ulasan</span>
      </div>

      {/* #3 Rating Summary */}
      <RatingSummary />

      {/* Review List */}
      <div>
        {mockReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {/* Write Review CTA */}
      <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <PenLine className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Bagikan Pengalamanmu!</h3>
        <p className="text-sm text-slate-400 mb-4">Sebagai member ternilai, feedback Anda membantu komunitas.</p>
        <button className="text-emerald-500 font-semibold text-sm hover:text-emerald-400 transition-colors underline underline-offset-4">
          Tulis Review
        </button>
      </div>
    </div>
  );
}
