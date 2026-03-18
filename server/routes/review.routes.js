const express = require("express");
const { body } = require("express-validator");
const { createReview, getReviewsForUser } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const createReviewValidation = [
	body("reviewedUser").isMongoId().withMessage("Valid reviewedUser is required"),
	body("rating")
		.isInt({ min: 1, max: 5 })
		.withMessage("Rating must be between 1 and 5"),
	body("comment")
		.optional({ values: "falsy" })
		.trim()
		.isLength({ max: 1000 })
		.withMessage("Comment must be at most 1000 characters"),
	body("job").optional({ values: "falsy" }).isMongoId().withMessage("Job must be a valid id"),
	body("service")
		.optional({ values: "falsy" })
		.isMongoId()
		.withMessage("Service must be a valid id"),
];

router.post("/", protect, createReviewValidation, validateRequest, createReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;
