const express = require("express");
const { createReview, getReviewsForUser } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;
