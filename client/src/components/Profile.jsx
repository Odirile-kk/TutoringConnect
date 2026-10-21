// User profile page.
//
// Handles:
// - View profile
// - Edit profile
// - Profile validation
// - System rating
// - Support query

import React, {
  useState,
} from "react";

import { api } from "../api.js";


export default function Profile({
  user,
  setUser,
}) {

  // ============================================================
  // PROFILE FIELDS
  // ============================================================

  const [name, setName] =
    useState(user.name || "");

  const [email, setEmail] =
    useState(user.email || "");


  // ============================================================
  // RATING
  // ============================================================

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");


  // ============================================================
  // SUPPORT
  // ============================================================

  const [support, setSupport] =
    useState("");


  // ============================================================
  // MESSAGES
  // ============================================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ============================================================
  // PROFILE VALIDATION
  // ============================================================

  function validateProfile() {

    if (
      !name.trim() ||
      name.trim().length < 2
    ) {

      return "Please enter a valid name.";

    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        email.trim()
      )
    ) {

      return "Please enter a valid email address.";

    }


    return null;

  }


  // ============================================================
  // SAVE PROFILE
  // ============================================================

  async function save() {

    setMessage("");

    setError("");


    const validationError =
      validateProfile();


    if (validationError) {

      setError(
        validationError
      );

      return;

    }


    try {

      const updated =
        await api("/me", {

          method: "PUT",

          body: JSON.stringify({

            name:
              name.trim(),

            email:
              email.trim().toLowerCase(),

          }),

        });


      // Normalise the returned user.

      const updatedUser = {

        ...user,

        id:
          updated.id ||
          updated._id ||
          user.id,

        name:
          updated.name,

        email:
          updated.email,

        role:
          updated.role ||
          user.role,

      };


      // Update React state.

      setUser(updatedUser);


      // Update local storage.

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );


      setMessage(
        "Profile saved successfully."
      );


    } catch (e) {

      setError(
        e.message
      );

    }

  }


  // ============================================================
  // SYSTEM RATING
  // ============================================================

  async function rate() {

    setMessage("");

    setError("");


    if (!comment.trim()) {

      setError(
        "Please enter a comment before submitting."
      );

      return;

    }


    try {

      await api(
        "/ratings/system",
        {

          method: "POST",

          body: JSON.stringify({

            rating:
              Number(rating),

            comment:
              comment.trim(),

          }),

        }
      );


      setComment("");


      setMessage(
        "Rating submitted successfully."
      );


    } catch (e) {

      setError(
        e.message
      );

    }

  }


  // ============================================================
  // SUPPORT QUERY
  // ============================================================

  async function supportSubmit() {

    setMessage("");

    setError("");


    if (!support.trim()) {

      setError(
        "Please enter your question or problem."
      );

      return;

    }


    try {

      await api(
        "/support",
        {

          method: "POST",

          body: JSON.stringify({

            message:
              support.trim(),

          }),

        }
      );


      setSupport("");


      setMessage(
        "Support query submitted successfully."
      );


    } catch (e) {

      setError(
        e.message
      );

    }

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <section>


      {/* ======================================================
          PROFILE
      ====================================================== */}

      <h2>
        My Profile
      </h2>

      <p>
        View and update your personal account information.
      </p>


      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {message && (

        <div className="success-message">

          {message}

        </div>

      )}


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (

        <div className="error-message">

          {error}

        </div>

      )}


      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      <div className="card">

        <h3>
          Personal Information
        </h3>


        <label>
          Full Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />


        <label>
          Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />


        <label>
          Account Role
        </label>

        <input
          type="text"
          value={user.role}
          readOnly
          disabled
        />


        <button
          onClick={save}
        >
          Save Profile
        </button>

      </div>


      {/* ======================================================
          SYSTEM RATING
      ====================================================== */}

      <div className="card">

        <h3>
          Rate Tutoring Connect
        </h3>


        <label>
          Rating
        </label>

        <select
          value={rating}
          onChange={(e) =>
            setRating(
              Number(e.target.value)
            )
          }
        >

          {[1, 2, 3, 4, 5].map(
            (value) => (

              <option
                key={value}
                value={value}
              >
                {value}
              </option>

            )
          )}

        </select>


        <textarea
          value={comment}
          placeholder="Tell us about your experience."
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
        />


        <button
          onClick={rate}
        >
          Submit Rating
        </button>

      </div>


      {/* ======================================================
          SUPPORT
      ====================================================== */}

      <div className="card">

        <h3>
          Support
        </h3>

        <p>
          Have a question or problem?
          Submit a support query.
        </p>


        <textarea
          value={support}
          placeholder="Enter your question or problem."
          onChange={(e) =>
            setSupport(
              e.target.value
            )
          }
        />


        <button
          onClick={supportSubmit}
        >
          Submit Support Query
        </button>

      </div>

    </section>

  );

}
