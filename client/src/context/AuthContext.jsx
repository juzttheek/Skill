import { createContext, useContext, useEffect, useMemo, useState } from "react";

const USER_KEY = "serviceHireUser";
const TOKEN_KEY = "serviceHireToken";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem(USER_KEY);
		const storedToken = localStorage.getItem(TOKEN_KEY);

		if (storedUser && storedToken) {
			try {
				setUser(JSON.parse(storedUser));
				setToken(storedToken);
			} catch (error) {
				localStorage.removeItem(USER_KEY);
				localStorage.removeItem(TOKEN_KEY);
			}
		}

		setLoading(false);
	}, []);

	const login = (userData, authToken) => {
		setUser(userData);
		setToken(authToken);
		localStorage.setItem(USER_KEY, JSON.stringify(userData));
		localStorage.setItem(TOKEN_KEY, authToken);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem(USER_KEY);
		localStorage.removeItem(TOKEN_KEY);
	};

	const updateUser = (newData) => {
		setUser((prev) => {
			const merged = { ...(prev || {}), ...(newData || {}) };
			localStorage.setItem(USER_KEY, JSON.stringify(merged));
			return merged;
		});
	};

	const value = useMemo(
		() => ({ user, token, loading, login, logout, updateUser }),
		[user, token, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

export default AuthContext;
