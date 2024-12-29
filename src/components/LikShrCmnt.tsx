import React, { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import CommentSection from "./CommentSection";
import { useOfferStore, Comment, Offer } from "@/store/offerStore";

const LikShrCmnt = ({ offerId, offer }: { offerId: string, offer: Offer }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1011); // Initialize with a value from props or API.
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const { addComment, incrementLike } = useOfferStore(); // Access zustand's addComment and incrementLike functions

  console.log(offer, "offers");
  

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleAddComment = async (newComment: Omit<Comment, "id" | "offerId">) => {
    try {
      const commentToAdd = {
        id: Date.now().toString(), // Use timestamp as ID
        ...newComment,
      };

      await addComment(offerId, commentToAdd); // Add comment to Firestore

      // Update local comments for immediate UI update
      addComment(offerId, commentToAdd);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await incrementLike(offerId, commentId); // Increment like in Firestore

      // Update local comments for immediate UI update
      incrementLike(offerId, commentId);
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  return (
    <div className="gap-y-2 flex flex-col">
      <div className="flex gap-x-4 justify-center items-center w-max">
        <Heart
          className={`w-6 h-6 cursor-pointer ${isLiked ? "text-orange-600 fill-orange-600" : "text-gray-500"}`}
          onClick={handleLikeToggle}
        />
        <MessageCircle
          className="w-6 h-6 cursor-pointer text-gray-500"
          onClick={() => setIsCommentSectionVisible(!isCommentSectionVisible)}
        />
        <Send className="w-6 h-6 cursor-pointer text-gray-500" />
      </div>
      <p>{likeCount} {likeCount === 1 ? "like" : "likes"}</p>
      {isCommentSectionVisible && (
        <CommentSection
          comments={
            offer.comments || []
          }
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onClose={() => setIsCommentSectionVisible(false)}
        />
      )}
    </div>
  );
};

export default LikShrCmnt;
