// Profile routes.
//
// Handles:
// - Viewing the currently logged-in user's profile
// - Updating the user's personal information
// - Profile validation
// - Duplicate email protection

import { Router } from "express";

import User from "../models/User.js";

import { authenticate } from "../middleware/auth.js";


const router = Router();


// All profile routes require authentication.

router.use(
  authenticate
);


// ============================================================
// GET CURRENT USER PROFILE
// ============================================================

router.get(
  "/",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user._id
        ).select("-password");


      if (!user) {

        return res.status(404).json({

          message:
            "User profile not found.",

        });

      }


      return res.json({

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

      });


    } catch (error) {

      console.error(
        "Profile retrieval error:",
        error,
      );


      return res.status(500).json({

        message:
          "Unable to retrieve profile.",

      });

    }

  },
);


// ============================================================
// UPDATE CURRENT USER PROFILE
// ============================================================

router.put(
  "/",
  async (req, res) => {

    try {

      const {
        name,
        email,
      } = req.body;


      // ======================================================
      // NAME VALIDATION
      // ======================================================

      if (
        !name ||
        name.trim().length < 2
      ) {

        return res.status(400).json({

          message:
            "Please enter a valid name.",

        });

      }


      // ======================================================
      // EMAIL VALIDATION
      // ======================================================

      if (!email) {

        return res.status(400).json({

          message:
            "Email address is required.",

        });

      }


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
      // CHECK DUPLICATE EMAIL
      // ======================================================

      const existingUser =
        await User.findOne({

          email:
            cleanEmail,

          _id: {
            $ne:
              req.user._id,
          },

        });


      if (existingUser) {

        return res.status(409).json({

          message:
            "That email address is already being used.",

        });

      }


      // ======================================================
      // UPDATE USER
      // ======================================================

      const updatedUser =
        await User.findByIdAndUpdate(

          req.user._id,

          {
            name:
              name.trim(),

            email:
              cleanEmail,
          },

          {
            new:
              true,

            runValidators:
              true,
          },

        ).select("-password");


      if (!updatedUser) {

        return res.status(404).json({

          message:
            "User profile not found.",

        });

      }


      // ======================================================
      // RETURN UPDATED USER
      // ======================================================

      return res.json({

        id:
          updatedUser._id,

        name:
          updatedUser.name,

        email:
          updatedUser.email,

        role:
          updatedUser.role,

      });


    } catch (error) {

      console.error(
        "Profile update error:",
        error,
      );


      return res.status(500).json({

        message:
          "Unable to update profile.",

      });

    }

  },
);


export default router;
