// Authentication and authorisation middleware.
//
// authenticate()
// - Checks whether a JWT was provided.
// - Verifies the JWT.
// - Retrieves the current user from MongoDB.
// - Places the current user in req.user.
//
// role()
// - Protects routes based on the user's current role.

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { JWT_SECRET } from "../config.js";


// ============================================================
// AUTHENTICATE
// ============================================================

export async function authenticate(
  req,
  res,
  next,
) {

  try {

    const authorization =
      req.headers.authorization || "";


    // ========================================================
    // CHECK BEARER TOKEN
    // ========================================================

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {

      return res.status(401).json({

        message:
          "Login required.",

      });

    }


    const token =
      authorization.substring(7);


    if (!token) {

      return res.status(401).json({

        message:
          "Authentication token missing.",

      });

    }


    // ========================================================
    // VERIFY JWT
    // ========================================================

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET,
      );


    // ========================================================
    // GET CURRENT USER
    // ========================================================
    //
    // We do NOT simply trust the role stored in the JWT.
    //
    // The current database user is loaded so that the latest
    // role is always used.
    //
    // This is particularly important for:
    //
    // Client/Admin permissions.

    const user =
      await User.findById(
        decoded.id
      ).select("-password");


    if (!user) {

      return res.status(401).json({

        message:
          "User account no longer exists.",

      });

    }


    // ========================================================
    // ADD USER TO REQUEST
    // ========================================================

    req.user = user;


    next();


  } catch (error) {

    console.error(
      "Authentication error:",
      error.message,
    );


    return res.status(401).json({

      message:
        "Invalid or expired login session.",

    });

  }

}


// ============================================================
// ROLE PROTECTION
// ============================================================

export function role(...roles) {

  return (
    req,
    res,
    next,
  ) => {

    if (!req.user) {

      return res.status(401).json({

        message:
          "Login required.",

      });

    }


    if (
      !roles.includes(
        req.user.role
      )
    ) {

      return res.status(403).json({

        message:
          "Access denied. You do not have permission to access this resource.",

      });

    }


    next();

  };

}
