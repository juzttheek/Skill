const express = require("express");
const multer = require("multer");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
  },
});

router.post("/", protect, upload.array("images", 5), createService);
router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.put("/:id", protect, upload.array("images", 5), updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;
