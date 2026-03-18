const express = require("express");
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

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", getAllJobs);
router.get("/:id", optionalProtect, getJobById);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);
router.post("/:id/apply", protect, applyToJob);
router.get("/:id/applications", protect, getApplicationsForJob);
router.patch("/:jobId/applications/:applicationId/accept", protect, acceptApplication);

module.exports = router;
