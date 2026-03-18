const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
	{
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			enum: ["digital", "local", "professional"],
			required: true,
		},
		budget: {
			type: Number,
			default: 0,
		},
		budgetType: {
			type: String,
			enum: ["fixed", "hourly"],
			default: "fixed",
		},
		deadline: {
			type: Date,
			default: null,
		},
		status: {
			type: String,
			enum: ["open", "in-progress", "completed", "cancelled"],
			default: "open",
		},
		applicants: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
			],
			default: [],
		},
		hiredWorker: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		location: {
			type: String,
			default: "",
		},
		tags: {
			type: [String],
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
