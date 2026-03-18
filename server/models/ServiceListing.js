const mongoose = require("mongoose");

const serviceListingSchema = new mongoose.Schema(
	{
		worker: {
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
		subcategory: {
			type: String,
			default: "",
		},
		price: {
			type: Number,
			required: true,
		},
		pricingType: {
			type: String,
			enum: ["fixed", "hourly", "negotiable"],
			default: "fixed",
		},
		deliveryTime: {
			type: String,
			default: "",
		},
		images: {
			type: [String],
			default: [],
		},
		tags: {
			type: [String],
			default: [],
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		rating: {
			type: Number,
			default: 0,
		},
		totalReviews: {
			type: Number,
			default: 0,
		},
		orders: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("ServiceListing", serviceListingSchema);
