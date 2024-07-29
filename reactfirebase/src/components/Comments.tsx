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
import * as React from "react";
import { useParams } from "react-router-dom";
import app from "../firebaseConfig";
import CommentForm from "./CommentForm";
import { useGlobalState } from "./GlobalStates";
import SingleComment from "./SingleComment";
import {
  Alert,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

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
          (commentData.rating !== null ||
            commentData.rating !== undefined ||
            commentData.rating !== 0) &&
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
  }, [firebaseId, email, editId, rating]);

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
      } else {
        const newCommentRef = push(ref(db, "comments"));
        await set(newCommentRef, newComment);
      }

      if (rating !== null) {
        const currentRatings = comments
          .filter((c) => c.rating !== null)
          .map((c) => c.rating);

        if (editId !== null) {
          const editIndex = comments.findIndex((c) => c.id === editId);
          if (editIndex !== -1) {
            currentRatings[editIndex] = rating;
          }
        } else {
          currentRatings.push(rating);
        }

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
    setRating(null);
    handleEdit2(comment);
  };
  const handleEdit2 = (comment: Comment) => {
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

  const handleRatingChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: number | null
  ) => {
    setRating(value ?? null);
    setRatingError(null);
  };

  const isEmailTaken = () => {
    return comments.some(
      (c) => c.email === email && c.rating !== null && c.id !== editId
    );
  };

  return (
    <Card variant="outlined" sx={{ mt: 5 }} style={{ padding: 40 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Typography
              style={{ fontWeight: "bold", marginBottom: 5 }}
              color="text.primary"
            >
              Kommentare
            </Typography>
            <Paper elevation={1} sx={{ p: 5 }}>
              {comments.length > 0 ? (
                <>
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
                </>
              ) : (
                <Alert severity="info">
                  Bisher wurden keine Kommentare geschrieben
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={4}>
            <Typography
              style={{ fontWeight: "bold", marginBottom: 5 }}
              color="text.primary"
            >
              Kommentar hinzufügen
            </Typography>
            <Paper elevation={1} sx={{ p: 5, background: "rgba(0,0,0,0.03)" }}>
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
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default Comments;
