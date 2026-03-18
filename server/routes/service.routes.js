const express = require("express");
const multer = require("multer");
const { body } = require("express-validator");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
  },
});

const serviceCreateValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description")
    .trim()
    .isLength({ min: 30 })
    .withMessage("Description must be at least 30 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("pricingType")
    .optional()
    .isIn(["fixed", "hourly"])
    .withMessage("Pricing type must be fixed or hourly"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),
];

const serviceUpdateValidation = [
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
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("pricingType")
    .optional()
    .isIn(["fixed", "hourly"])
    .withMessage("Pricing type must be fixed or hourly"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0"),
];

router.post("/", protect, upload.array("images", 5), serviceCreateValidation, validateRequest, createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", protect, upload.array("images", 5), serviceUpdateValidation, validateRequest, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;
