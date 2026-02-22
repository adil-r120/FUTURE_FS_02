import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "clms_auth_user";
const USERS_KEY = "clms_registered_users";

interface StoredUser extends User {
    password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const getUsers = (): StoredUser[] => {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            if (users.length === 0) {
                const demoUser = {
                    id: "demo-user",
                    name: "Demo User",
                    email: "demo@leadcrm.io",
                    password: "Demo@1234",
                    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Demo"
                };
                return [demoUser];
            }
            return users;
        } catch {
            return [];
        }
    };

    const login = async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 800)); // simulate network
        const users = getUsers();
        const found = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) {
            return { success: false, error: "Invalid email or password." };
        }
        const { password: _pw, ...userData } = found;
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
    };

    const signup = async (name: string, email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 800));
        const users = getUsers();
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: "An account with this email already exists." };
        }
        const newUser: StoredUser = {
            id: Date.now().toString(),
            name,
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            password,
        };
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
        const { password: _pw, ...userData } = newUser;
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return { success: false, error: "Not authenticated" };

        await new Promise((r) => setTimeout(r, 600)); // simulate network

        const currentUsers = getUsers();
        const userIndex = currentUsers.findIndex(u => u.id === user.id);

        if (userIndex === -1) return { success: false, error: "User not found" };

        const updatedUser = { ...currentUsers[userIndex], ...updates };
        const newUsersList = [...currentUsers];
        newUsersList[userIndex] = updatedUser;

        localStorage.setItem(USERS_KEY, JSON.stringify(newUsersList));

        const { password: _pw, ...userData } = updatedUser;
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
