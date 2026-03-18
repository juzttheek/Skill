const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || "";

		if (!authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Not authorized, token missing" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({ message: "Not authorized, user not found" });
		}

		req.user = user;
		return next();
	} catch (error) {
		return res.status(401).json({ message: "Not authorized, invalid token" });
	}
};

const optionalProtect = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || "";
		if (!authHeader.startsWith("Bearer ")) {
			return next();
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (user) {
			req.user = user;
		}

		return next();
	} catch (error) {
		return next();
	}
};

const adminOnly = (req, res, next) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({ message: "Forbidden: Admins only" });
	}
	return next();
};

module.exports = { protect, optionalProtect, adminOnly };

