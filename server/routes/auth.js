// Authentication routes.
//
// Handles:
// - Student registration
// - Tutor registration
// - Login
// - Password hashing
// - JWT creation
// - Role validation
//
// Public registration can create:
// - student
// - tutor
//
// Public registration CANNOT create:
// - admin

import { Router } from "express";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import TutorProfile from "../models/TutorProfile.js";

import { JWT_SECRET } from "../config.js";


const router = Router();


// ============================================================
// CREATE JWT
// ============================================================

function createToken(user) {

  return jwt.sign(

    {
      id:
        user._id,

      role:
        user.role,
    },

    JWT_SECRET,

    {
      expiresIn: "8h",
    },

  );

}


// ============================================================
// REGISTER
// ============================================================

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
        role,
      } = req.body;


      // ======================================================
      // REQUIRED FIELDS
      // ======================================================

      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Name, email and password are required.",

        });

      }


      // ======================================================
      // NAME VALIDATION
      // ======================================================

      const cleanName =
        name.trim();


      if (
        cleanName.length < 2
      ) {

        return res.status(400).json({

          message:
            "Please enter a valid full name.",

        });

      }


      // ======================================================
      // EMAIL VALIDATION
      // ======================================================

      const cleanEmail =
        email.trim().toLowerCase();


      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !emailRegex.test(
          cleanEmail
        )
      ) {

        return res.status(400).json({

          message:
            "Please enter a valid email address.",

        });

      }


      // ======================================================
      // PASSWORD VALIDATION
      // ======================================================

      if (
        password.length < 8
      ) {

        return res.status(400).json({

          message:
            "Password must contain at least 8 characters.",

        });

      }


      // ======================================================
      // ADMIN REGISTRATION
      // ======================================================
      //
      // Users cannot register themselves as administrators.
      //
      // Admin accounts must be created by an existing
      // administrator or directly in the database.

      if (
        role === "admin"
      ) {

        return res.status(403).json({

          message:
            "Administrator accounts cannot be created through public registration.",

        });

      }


      // ======================================================
      // VALIDATE ROLE
      // ======================================================

      const selectedRole =
        role === "tutor"
          ? "tutor"
          : "student";


      // ======================================================
      // CHECK DUPLICATE EMAIL
      // ======================================================

      const existingUser =
        await User.findOne({
          email:
            cleanEmail,
        });


      if (existingUser) {

        return res.status(409).json({

          message:
            "An account with this email already exists.",

        });

      }


      // ======================================================
      // HASH PASSWORD
      // ======================================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          12,
        );


      // ======================================================
      // CREATE USER
      // ======================================================

      const user =
        await User.create({

          name:
            cleanName,

          email:
            cleanEmail,

          password:
            hashedPassword,

          role:
            selectedRole,

        });


      // ======================================================
      // CREATE TUTOR PROFILE
      // ======================================================

      if (
        user.role === "tutor"
      ) {

        await TutorProfile.create({

          user:
            user._id,

          subjects:
            [],

        });

      }


      // ======================================================
      // CREATE JWT
      // ======================================================

      const token =
        createToken(user);


      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(201).json({

        message:
          "Registration successful.",

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

        },

      });


    } catch (error) {

      console.error(
        "Registration error:",
        error,
      );


      return res.status(500).json({

        message:
          "Unable to register right now.",

      });

    }

  },
);


// ============================================================
// LOGIN
// ============================================================

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;


      // ======================================================
      // REQUIRED FIELDS
      // ======================================================

      if (
        !email ||
        !password
      ) {

        return res.status(400).json({

          message:
            "Email and password are required.",

        });

      }


      // ======================================================
      // CLEAN EMAIL
      // ======================================================

      const cleanEmail =
        email.trim().toLowerCase();


      // ======================================================
      // FIND USER
      // ======================================================

      const user =
        await User.findOne({

          email:
            cleanEmail,

        });


      // ======================================================
      // INVALID LOGIN
      // ======================================================

      if (!user) {

        return res.status(401).json({

          message:
            "Invalid email or password.",

        });

      }


      // ======================================================
      // CHECK PASSWORD
      // ======================================================

      const passwordCorrect =
        await bcrypt.compare(

          password,

          user.password,

        );


      if (!passwordCorrect) {

        return res.status(401).json({

          message:
            "Invalid email or password.",

        });

      }


      // ======================================================
      // CREATE JWT
      // ======================================================

      const token =
        createToken(user);


      // ======================================================
      // RESPONSE
      // ======================================================

      return res.json({

        message:
          "Login successful.",

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

        },

      });


    } catch (error) {

      console.error(
        "Login error:",
        error,
      );


      return res.status(500).json({

        message:
          "Unable to log in right now.",

      });

    }

  },
);


export default router;
