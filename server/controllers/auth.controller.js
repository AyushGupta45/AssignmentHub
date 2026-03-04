import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { createError } from "../utils/error.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => {
  const { password, ...rest } = user.toObject();
  return rest;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/signup — student signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createError(400, "Name, email, and password are required"));
    }

    if (password.length < 6) {
      return next(createError(400, "Password must be at least 6 characters"));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(createError(409, "Email already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
    });

    await newUser.save();
    const token = generateToken(newUser);

    res
      .cookie("access_token", token, COOKIE_OPTIONS)
      .status(201)
      .json({
        success: true,
        user: sanitizeUser(newUser),
      });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signin — student signin
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return next(createError(401, "Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError(401, "Invalid email or password"));
    }

    const token = generateToken(user);

    res.cookie("access_token", token, COOKIE_OPTIONS).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signout
export const signout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    })
    .json({ success: true, message: "Signed out successfully" });
};

// GET /api/auth/me — get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/google — Google OAuth sign-in / sign-up
export const google = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return next(createError(400, "Google credential is required"));
    }

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Look for existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Link googleId if user exists by email but hasn't linked Google yet
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create a new student account
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        profilePicture: picture || undefined,
        role: "student",
      });
      await user.save();
    }

    const token = generateToken(user);

    res.cookie("access_token", token, COOKIE_OPTIONS).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};
