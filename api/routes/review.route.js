import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { addReview, 
            getReviews,
            getReview, 
            getUserReviewStats } from "../controllers/review.controller.js";

// using the router to create the request
const router = express.Router();

// new review (review, rating, postById, postToId, grade) to save into mongoDB
router.post("/", verifyToken, addReview);
router.get("/user/:userId", verifyToken, getReviews)
router.get("/:id", getReview);
router.get("/stats/:userId", verifyToken, getUserReviewStats);

export default router;