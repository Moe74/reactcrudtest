import {
  equalTo,
  getDatabase,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import _ from "lodash";
import { RatingChangeEvent } from "primereact/rating";
import * as React from "react";
import { useParams } from "react-router-dom";
import app from "../firebaseConfig";
import CommentForm from "./CommentForm";
import { useGlobalState } from "./GlobalStates";
import SingleComment from "./SingleComment";

export type Comment = {
  id?: string;
  rezeptId: string;
  name: string;
  email: string;
  comment?: string | null;
  rating?: number | null;
  timestamp?: string;
};

function Comments() {
  const { firebaseId } = useParams<{ firebaseId: string }>();
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [loggedInName] = useGlobalState("userName");
  const [loggedInEmail] = useGlobalState("userEmail");
  const [name, setName] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [comment, setComment] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [hasGivenRating, setHasGivenRating] = React.useState<boolean>(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [ratingError, setRatingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      setName(loggedInName || "");
      setEmail(loggedInEmail || "");
    }
  }, [isLoggedIn, loggedInName, loggedInEmail]);

  React.useEffect(() => {
    if (!firebaseId) {
      return;
    }

    const db = getDatabase(app);
    const commentsRef = query(
      ref(db, "comments"),
      orderByChild("rezeptId"),
      equalTo(firebaseId)
    );
    onValue(commentsRef, (snapshot) => {
      const commentsList: Comment[] = [];
      let hasExistingRating = false;

      snapshot.forEach((childSnapshot) => {
        const commentData = childSnapshot.val() as Comment;
        if (
          commentData.email === email &&
          commentData.rating !== null &&
          commentData.id !== editId
        ) {
          hasExistingRating = true;
        }
        commentsList.push({ id: childSnapshot.key, ...commentData });
      });

      commentsList.sort((a, b) => {
        const dateA = new Date(a.timestamp ?? 0);
        const dateB = new Date(b.timestamp ?? 0);
        return dateB.getTime() - dateA.getTime();
      });

      setComments(commentsList);
      setHasGivenRating(hasExistingRating);
    });
  }, [firebaseId, email, editId]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!isValidEmail(email)) {
      setEmailError("Invalid email address.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!valid) {
      return;
    }

    if (!firebaseId || !name || !email || (!comment && rating === null)) {
      alert("Name, Email, and either a comment or a rating must be provided.");
      return;
    }

    const timestamp = new Date().toISOString();
    const newComment: Comment = {
      rezeptId: firebaseId,
      name,
      email,
      comment: comment || null,
      rating: rating,
      timestamp,
    };

    setIsLoading(true);
    const db = getDatabase(app);

    try {
      if (editId) {
        const commentRef = ref(db, `comments/${editId}`);
        await update(commentRef, newComment);
        alert("Comment updated successfully");
      } else {
        const newCommentRef = push(ref(db, "comments"));
        await set(newCommentRef, newComment);
        alert("Comment saved successfully");
      }

      if (rating !== null) {
        const currentRatings = comments
          .filter((c) => c.rating !== null)
          .map((c) => c.rating!);
        currentRatings.push(rating);
        const averageRating = _.round(_.mean(currentRatings) * 2) / 2;

        const recipeRef = ref(db, `recipes/${firebaseId}`);
        await update(recipeRef, { rating: averageRating });
      }

      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        alert(`An error occurred: ${error.message}`);
      } else {
        alert("An unknown error occurred.");
      }
    }

    setIsLoading(false);
  };

  const handleEdit = (comment: Comment) => {
    setName(comment.name);
    setEmail(comment.email);
    setComment(comment.comment ?? null);
    setRating(comment.rating ?? null);
    setEditId(comment.id || null);
    setHasGivenRating(comment.rating !== null);
  };

  const handleDelete = async (id: string) => {
    const db = getDatabase(app);
    const commentRef = ref(db, `comments/${id}`);
    await remove(commentRef);
    alert("Comment deleted successfully");
  };

  const resetForm = () => {
    setName(loggedInName || "");
    setEmail(loggedInEmail || "");

    if (editId) {
      setHasGivenRating(false);
    }

    setComment(null);
    setRating(null);
    setEditId(null);
  };

  const handleRatingChange = (e: RatingChangeEvent) => {
    setRating(e.value ?? null);
    setRatingError(null);
  };

  const isEmailTaken = () => {
    return comments.some(
      (c) => c.email === email && c.rating !== null && c.id !== editId
    );
  };

  return (
    <div>
      <h3>Add Comment</h3>

      <CommentForm
        name={name}
        email={email}
        emailError={emailError}
        ratingError={ratingError}
        comment={comment}
        rating={rating}
        hasGivenRating={hasGivenRating}
        isLoading={isLoading}
        onResetForm={resetForm}
        editId={editId}
        onSubmitForm={handleSubmit}
        onChangeName={(e) => setName(e.target.value)}
        onChangeComment={(e) => setComment(e.target.value || null)}
        onChangeRating={handleRatingChange}
        onChangeEmail={(e) => {
          setEmail(e.target.value);
          setHasGivenRating(isEmailTaken());
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "10px 20px", alignItems: "center" }}>
        {comments.length > 0 ? (
          <div style={{ gridColumn: "1 / span 2" }}>
            <h3>Existing Comments</h3>
            <div>
              {comments.map((c, index) => (
                <SingleComment
                  email={c.email}
                  name={c.name}
                  comment={c.comment}
                  key={index}
                  rating={c.rating}
                  timestamp={c.timestamp}
                  onHandleEdit={() => handleEdit(c)}
                  onHandleDelete={() => handleDelete(c.id!)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ gridColumn: "1 / span 2" }}>No comments yet.</div>
        )}
      </div>
    </div>
  );
}

export default Comments;
