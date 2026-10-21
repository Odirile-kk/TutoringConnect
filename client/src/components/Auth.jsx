// Authentication screen.
//
// Handles:
// - Student registration
// - Tutor registration
// - Login
// - Password validation
// - Email validation
// - Registration validation
// - Login errors
// - Loading state

import React, { useState } from "react";

import { api } from "../api.js";


export default function Auth({ onLogin }) {

  // Login or registration mode.

  const [register, setRegister] =
    useState(false);


  // Form information.

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });


  // Error/success message.

  const [message, setMessage] =
    useState("");


  // Loading state.

  const [loading, setLoading] =
    useState(false);


  // ============================================================
  // UPDATE FORM
  // ============================================================

  function updateField(field, value) {

    setForm((previous) => ({

      ...previous,

      [field]: value,

    }));

  }


  // ============================================================
  // VALIDATE FORM
  // ============================================================

  function validateForm() {

    // Registration validation.

    if (register) {

      if (
        !form.name.trim() ||
        form.name.trim().length < 2
      ) {

        return "Please enter your full name.";

      }


      if (!form.email.trim()) {

        return "Please enter your email address.";

      }


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (!emailRegex.test(form.email.trim())) {

        return "Please enter a valid email address.";

      }


      if (form.password.length < 8) {

        return (
          "Password must contain at least 8 characters."
        );

      }


      if (
        form.password !==
        form.confirmPassword
      ) {

        return "Passwords do not match.";

      }


      if (
        form.role !== "student" &&
        form.role !== "tutor"
      ) {

        return "Please select a valid account type.";

      }

    }

    // Login validation.

    else {

      if (!form.email.trim()) {

        return "Please enter your email address.";

      }


      if (!form.password) {

        return "Please enter your password.";

      }

    }


    return null;

  }


  // ============================================================
  // SUBMIT
  // ============================================================

  async function submit(e) {

    e.preventDefault();

    setMessage("");


    // Validate before sending to server.

    const validationError =
      validateForm();


    if (validationError) {

      setMessage(validationError);

      return;

    }


    setLoading(true);


    try {

      const endpoint =
        register
          ? "/auth/register"
          : "/auth/login";


      // Only send fields required by the server.

      const requestData =
        register
          ? {
              name: form.name.trim(),

              email:
                form.email.trim().toLowerCase(),

              password:
                form.password,

              role:
                form.role,
            }
          : {
              email:
                form.email.trim().toLowerCase(),

              password:
                form.password,
            };


      const response =
        await api(endpoint, {

          method: "POST",

          body:
            JSON.stringify(requestData),

        });


      // Send successful authentication
      // to App.jsx.

      onLogin(response);


    } catch (error) {

      setMessage(
        error.message ||
        "Authentication failed."
      );

    } finally {

      setLoading(false);

    }

  }


  // ============================================================
  // SWITCH LOGIN / REGISTER
  // ============================================================

  function switchMode() {

    setRegister(
      (previous) => !previous
    );

    setMessage("");

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <main className="auth">

      <h1>
        Tutoring Connect
      </h1>


      <h2>
        {register
          ? "Create Your Account"
          : "Welcome Back"}
      </h2>


      <p>
        {register
          ? "Register to use the Tutoring Connect platform."
          : "Login to access your tutoring account."}
      </p>


      {/* Error message */}

      {message && (

        <div className="error-message">

          {message}

        </div>

      )}


      <form
        onSubmit={submit}
      >


        {/* ==================================================
            REGISTRATION ONLY
        ================================================== */}

        {register && (

          <>

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              required
            />


            <label>
              Account Type
            </label>

            <select
              value={form.role}
              onChange={(e) =>
                updateField(
                  "role",
                  e.target.value
                )
              }
            >

              <option value="student">
                Student / Client
              </option>

              <option value="tutor">
                Tutor
              </option>

            </select>

          </>

        )}


        {/* ==================================================
            EMAIL
        ================================================== */}

        <label>
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) =>
            updateField(
              "email",
              e.target.value
            )
          }
          required
        />


        {/* ==================================================
            PASSWORD
        ================================================== */}

        <label>
          Password
        </label>

        <input
          type="password"
          placeholder={
            register
              ? "Minimum 8 characters"
              : "Enter your password"
          }
          value={form.password}
          onChange={(e) =>
            updateField(
              "password",
              e.target.value
            )
          }
          required
        />


        {/* ==================================================
            CONFIRM PASSWORD
        ================================================== */}

        {register && (

          <>

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateField(
                  "confirmPassword",
                  e.target.value
                )
              }
              required
            />

          </>

        )}


        {/* ==================================================
            SUBMIT
        ================================================== */}

        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Please wait..."
            : register
              ? "Create Account"
              : "Login"}

        </button>

      </form>


      {/* ======================================================
          SWITCH LOGIN / REGISTER
      ====================================================== */}

      <button
        type="button"
        onClick={switchMode}
      >

        {register
          ? "Already have an account? Login"
          : "Don't have an account? Create Account"}

      </button>

    </main>

  );

}
