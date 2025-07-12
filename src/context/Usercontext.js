import { createContext, useState } from "react";
import {jwtDecode} from "jwt-decode";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user_id || decodedToken.id || decodedToken._id;
                return { ...parsedUser, userId }; // Ensure userId is always available
            } catch (error) {
                console.error("Error decoding token:", error);
                return null;
            }
        }
        return null;
    });

    const loginUser = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
    };
    const [users, setUsers] = useState([]);

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser , users, setUsers  }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
