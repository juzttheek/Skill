const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		conversationId: {
			type: String,
			required: true,
			index: true,
		},
	},
	{ timestamps: true }
);

messageSchema.pre("validate", function setConversationId(next) {
	if (!this.conversationId && this.sender && this.receiver) {
		this.conversationId = [this.sender.toString(), this.receiver.toString()]
			.sort()
			.join("_");
	}
	next();
});

module.exports = mongoose.model("Message", messageSchema);
