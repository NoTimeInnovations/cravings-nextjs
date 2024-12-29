import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Comment } from "@/store/offerStore";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (newComment: Omit<Comment, "id" | "offerId">) => void;
  onLikeComment: (commentId: string) => void;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  onLikeComment,
  onClose,
}) => {
  const [newComment, setNewComment] = useState<string>("");

  console.log(comments, "comments");
  

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const newCommentObj = {
        name: "current_user", // Replace with actual logged-in user's name
        comment: newComment,
        likes: 0,
      };
      onAddComment(newCommentObj); // Call the parent component's addComment function
      setNewComment("");
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg p-4"
      onTouchStart={(e) => {
        const startY = e.touches[0].clientY;
        const handleTouchMove = (e: TouchEvent) => {
          const endY = e.touches[0].clientY;
          if (endY - startY > 50) {
            onClose();
            document.removeEventListener("touchmove", handleTouchMove);
          }
        };
        document.addEventListener("touchmove", handleTouchMove);
      }}
    >
      <div className="overflow-y-auto max-h-60">
        {comments.map((comment) => (
          <div key={comment.offerId} className="flex items-start mb-4">
            <img
              src="https://via.placeholder.com/40" // Placeholder for profile picture
              alt="Profile"
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 mb-1">{comment.name}</p>
              <div className="flex justify-between w-full">
                <p className="text-sm text-gray-600 mb-1">{comment.comment}</p>
                <div className="flex items-center text-gray-500 text-xs">
                  <Heart
                    className={`w-4 h-4 mr-1 cursor-pointer ${comment.likes > 0 ? "fill-red-500 text-red-500" : "fill-none"}`}
                    onClick={() => onLikeComment(comment.offerId)} // Update to handle like on commentId
                  />
                  <span>{comment.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center mt-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-800 bg-white"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={handleAddComment}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
