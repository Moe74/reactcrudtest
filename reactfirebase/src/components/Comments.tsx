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
import * as React from "react";
import { useParams } from "react-router-dom";
import app from "../firebaseConfig";
import _ from "lodash";
import { useGlobalState } from "./GlobalStates";

export type Comment = {
  id?: string;
  rezeptId: string;
  name: string;
  email: string;
  comment?: string | null;
  rating?: number | null;
  timestamp?: string;
};

export interface Comments {
  id: string;
  username: string;
  email?: string;
  date: string;
  rezeptId: string;
  rezeptRating: number;
  rezeptComment?: string;
}

function Comments() {
  const { firebaseId } = useParams<{ firebaseId: string }>();


  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [userIsAdmin] = useGlobalState("userIsAdmin");
  const [loggedInName] = useGlobalState("userName");
  const [loggedInEmail] = useGlobalState("userName");

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
    // Set name and email based on logged-in user
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

      /*  hallo */

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

    // Proceed to update or set the comment as the data is now valid
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

      // Calculate new average rating
      if (rating !== null) {
        const currentRatings = comments
          .filter((c) => c.rating !== null)
          .map((c) => c.rating!);
        currentRatings.push(rating);
        const averageRating = _.round(_.mean(currentRatings) * 2) / 2;

        // Update recipe with new average rating
        const recipeRef = ref(db, `recipes/${firebaseId}`);
        await update(recipeRef, { rating: averageRating });
      }

      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        // Hier können wir sicher sein, dass es sich um ein Error-Objekt handelt
        alert(`An error occurred: ${error.message}`);
      } else {
        // Hier handeln Sie den Fall, wenn der Fehler nicht vom Typ Error ist
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

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setRating(value);
    setRatingError(null);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    } as const;
    const timeOptions = { hour: "2-digit", minute: "2-digit" } as const;
    return `${date.toLocaleDateString(
      "de-DE",
      dateOptions
    )}, ${date.toLocaleTimeString("de-DE", timeOptions)} Uhr`;
  };

  const isEmailTaken = () => {
    return comments.some(
      (c) => c.email === email && c.rating !== null && c.id !== editId
    );
  };

  return (
    <div>
      <h3>Add Comment</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "10px 20px",
          alignItems: "center",
        }}
      >
        <div>Name</div>
        {isLoggedIn ? (
          <div>{name}</div>
        ) : (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={name ? "success" : "error"}
          />
        )}

        <div>Email</div>
        {isLoggedIn ? (
          <div>{email}</div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setHasGivenRating(isEmailTaken());
              }}
              className={email ? "success" : "error"}
            />
            {emailError && (
              <>
                <div />
                <div className="missing">{emailError}</div>
              </>
            )}
          </>
        )}

        <div>Comment (optional)</div>
        <textarea
          value={comment || ""}
          onChange={(e) => setComment(e.target.value || null)}
        />

        <div>Rating (optional, 1-5)</div>
        <div>
          {[1, 2, 3, 4, 5].map((val) => (
            <span key={val}>
              {val}
              <input
                type="radio"
                value={val}
                checked={rating === val}
                onChange={handleRatingChange}
                disabled={hasGivenRating}
                style={{ marginRight: 10 }}
              />
            </span>
          ))}
        </div>
        {ratingError && (
          <>
            <div />
            <div className="missing">{ratingError}</div>
          </>
        )}
        {hasGivenRating && (
          <>
            <div />
            <div className="info">
              You have already given a rating for this recipe.
            </div>
          </>
        )}

        <button onClick={resetForm} disabled={isLoading} className="btn">
          Reset
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            isLoading || !name || !email || (!comment && rating === null)
          }
          className="btn"
        >
          {editId ? "Update" : "Submit"}
        </button>

        {comments.length > 0 ? (
          <div style={{ gridColumn: "1 / span 2" }}>
            <h3>Existing Comments</h3>
            <div>
              {comments.map((c, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 10,
                    borderTop: "1px solid grey",
                    padding: 10,
                  }}
                >
                  {isLoggedIn && userIsAdmin && (
                    <>
                      <button
                        onClick={() => handleEdit(c)}
                        className="btn"
                        style={{ float: "right" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id!)}
                        className="btn"
                        style={{ float: "right" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <div style={{ fontWeight: 600 }}>
                    {c.name}{" "}
                    <span style={{ fontWeight: 100 }}>({c.email})</span>
                  </div>
                  <small>
                    am{" "}
                    {c.timestamp
                      ? formatTimestamp(c.timestamp)
                      : "No timestamp"}
                  </small>
                  {c.rating && <div>Rating: {c.rating}</div>}
                  {c.comment && (
                    <div
                      style={{
                        paddingLeft: 10,
                        borderLeft: "3px double rgba(0,0,0,0.2)",
                        marginTop: 10,
                      }}
                    >
                      {c.comment}
                    </div>
                  )}
                  <br />
                  <br />
                </div>
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
