import * as React from "react";
import { useGlobalState } from "./GlobalStates";
import { Rating, RatingChangeEvent } from "primereact/rating";

interface CommentFormProps {
  emailError: string | null;
  ratingError: string | null;
  name: string;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  comment: string | null;
  onChangeComment: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rating: number | null;
  onChangeRating: (e: RatingChangeEvent) => void;
  hasGivenRating: boolean;
  isLoading: boolean;
  onResetForm: () => void;
  onSubmitForm: () => void;
  editId: string | null;
}

const CommentForm = (p: CommentFormProps) => {
  const {
    emailError,
    ratingError,
    name,
    onChangeName,
    email,
    onChangeEmail,
    comment,
    onChangeComment,
    rating,
    onChangeRating,
    hasGivenRating,
    isLoading,
    onResetForm,
    onSubmitForm,
    editId,
  } = p;
  const [isLoggedIn] = useGlobalState("userIsLoggedIn");
  const [userEmail] = useGlobalState("userEmail");
  const [userIsAdmin] = useGlobalState("userIsAdmin");

  const allowRate =
    (editId && userEmail === email && !hasGivenRating) ||
    (editId && userIsAdmin && !hasGivenRating) ||
    !hasGivenRating;
  return (
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
          onChange={onChangeName}
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
            onChange={onChangeEmail}
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
      <textarea value={comment || ""} onChange={onChangeComment} />

      <div>Rating (optional, 1-5)</div>
      <div>
        <Rating
          value={rating ?? undefined}
          cancel={false}
          onChange={onChangeRating}
          disabled={!allowRate}
        />
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

      <button onClick={onResetForm} disabled={isLoading} className="btn">
        Reset
      </button>
      <button
        onClick={onSubmitForm}
        disabled={isLoading || !name || !email || (!comment && rating === null)}
        className="btn"
      >
        {editId ? "Update" : "Submit"}
      </button>
    </div>
  );
};
export default CommentForm;
