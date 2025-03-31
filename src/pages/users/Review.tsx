import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { AiOutlineStar, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { API_BASE_URL, API_GET_ALL_USER_REVIEW_URL } from "../../utils/api";
import { useSelector } from "react-redux";

interface Review {
  _id: string;
  rating: number;
  content: string; // Changed from 'comment' to match backend schema
  createdAt: string;
  showtimeId: string;
  showName: string;
}

const Review: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editContent, setEditContent] = useState<string>("");
  const userId = useSelector((state: any) => state.user.auth.userInfo.id);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to view your reviews");
          return;
        }

        const response = await axios.get(`${API_GET_ALL_USER_REVIEW_URL}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
          params: { page, limit: 5 }, // Re-added pagination params
        });

        if (response.data.success) {
          setReviews(response.data.data.reviews);
          setTotalPages(response.data.data.totalPages);
        } else {
          toast.error(response.data.message || "Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Unable to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [page]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditContent(review.content);
  };

  const handleSaveEdit = async (showtimeId: string, reviewId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/user/showtimes/${showtimeId}/reviews/${reviewId}`,
        { rating: editRating, content: editContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setReviews(
          reviews.map((r) =>
            r._id === reviewId
              ? { ...r, rating: editRating, content: editContent }
              : r
          )
        );
        setEditingReview(null);
        toast.success("Review updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDeleteReview = async (showtimeId: string, reviewId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_BASE_URL}/user/showtimes/${showtimeId}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReviews(reviews.filter((review) => review._id !== reviewId));
        toast.success("Review deleted successfully");
      } else {
        toast.error(response.data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <AiOutlineStar
        key={index}
        className={`h-5 w-5 ${index < rating ? "text-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">Loading your reviews...</CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>You haven't written any reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.map((review: Review) => (
            <div key={review._id} className="border-b last:border-b-0 py-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-xl">{review.showName}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditReview(review)}
                  >
                    <AiOutlineEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteReview(review.showtimeId, review._id)}
                  >
                    <AiOutlineDelete className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingReview === review._id ? (
                <div className="space-y-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editRating}
                    onChange={(e) => setEditRating(parseInt(e.target.value))}
                    className="w-16 p-1 border rounded"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleSaveEdit(review.showtimeId, review._id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingReview(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Review;