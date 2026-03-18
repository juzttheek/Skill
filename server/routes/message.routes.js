const express = require("express");
const { body } = require("express-validator");
const {
  sendMessage,
  getConversation,
  getConversationList,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const sendMessageValidation = [
  body("receiverId").isMongoId().withMessage("Valid receiverId is required"),
  body("text")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message text must be between 1 and 2000 characters"),
];

router.post("/", protect, sendMessageValidation, validateRequest, sendMessage);
router.get("/conversations", protect, getConversationList);
router.get("/conversation/:otherUserId", protect, getConversation);
router.get("/:otherUserId", protect, getConversation);

module.exports = router;
