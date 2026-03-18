const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
	{
		job: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Job",
			required: true,
		},
		worker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		coverLetter: {
			type: String,
			required: true,
		},
		proposedRate: {
			type: Number,
			default: 0,
		},
		estimatedTime: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
