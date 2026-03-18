const mongoose = require("mongoose");

const workerProfileSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		bio: {
			type: String,
			default: "",
		},
		location: {
			type: String,
			default: "",
		},
		skills: {
			type: [String],
			default: [],
		},
		categories: {
			type: [
				{
					type: String,
					enum: ["digital", "local", "professional"],
				},
			],
			default: [],
		},
		hourlyRate: {
			type: Number,
			default: 0,
		},
		availability: {
			type: Boolean,
			default: true,
		},
		completedJobs: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 0,
		},
		totalReviews: {
			type: Number,
			default: 0,
		},
		portfolio: {
			type: [
				{
					title: { type: String, default: "" },
					description: { type: String, default: "" },
					imageUrl: { type: String, default: "" },
				},
			],
			default: [],
		},
		languages: {
			type: [String],
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("WorkerProfile", workerProfileSchema);
