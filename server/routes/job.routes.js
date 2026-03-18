const express = require("express");
const { body, param } = require("express-validator");
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getApplicationsForJob,
  acceptApplication,
} = require("../controllers/jobController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const jobCreateValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description")
    .trim()
    .isLength({ min: 30 })
    .withMessage("Description must be at least 30 characters"),
  body("budget")
    .isFloat({ min: 1 })
    .withMessage("Budget must be greater than 0"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("deadline")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Deadline must be a valid date"),
];

const jobUpdateValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 30 })
    .withMessage("Description must be at least 30 characters"),
  body("budget")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Budget must be greater than 0"),
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("deadline")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Deadline must be a valid date"),
];

const applyValidation = [
  body("coverLetter")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Cover letter must be at least 50 characters"),
  body("proposedRate")
    .optional({ values: "falsy" })
    .isFloat({ min: 1 })
    .withMessage("Proposed rate must be greater than 0"),
  body("estimatedTime")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2 })
    .withMessage("Estimated time must be at least 2 characters"),
];

const acceptValidation = [
  param("jobId").isMongoId().withMessage("Invalid job id"),
  param("applicationId").isMongoId().withMessage("Invalid application id"),
];

router.post("/", protect, jobCreateValidation, validateRequest, createJob);
router.get("/", getAllJobs);
router.get("/:id", optionalProtect, getJobById);
router.put("/:id", protect, jobUpdateValidation, validateRequest, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyValidation, validateRequest, applyToJob);
router.get("/:id/applications", protect, getApplicationsForJob);
router.patch(
  "/:jobId/applications/:applicationId/accept",
  protect,
  acceptValidation,
  validateRequest,
  acceptApplication
);

module.exports = router;
