import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, UserRound } from "lucide-react";

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password || !confirm) {
            setError("Please fill in all fields.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        const result = await signup(name, email, password);
        setLoading(false);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.error || "Sign up failed.");
        }
    };

    const strength = (() => {
        if (!password) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthClass = ["", "auth-strength-1", "auth-strength-2", "auth-strength-3", "auth-strength-4"][strength];

    return (
        <div className="auth-page">
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />
            <div className="auth-blob auth-blob-3" />

            <div className="auth-container">
                {/* Left panel */}
                <div className="auth-brand-panel">
                    <div className="auth-brand-inner">
                        <div className="auth-logo">
                            <img src="/logo.png" alt="Lead CRM Logo" className="auth-logo-img" />
                        </div>
                        <h1 className="auth-brand-title">Lead CRM</h1>
                        <p className="auth-brand-tagline">
                            Join thousands of sales teams closing more deals.
                        </p>
                        <div className="auth-features">
                            {[
                                "Free to get started — no card needed",
                                "Unlimited leads & pipeline stages",
                                "Real-time activity feed & analytics",
                            ].map((f) => (
                                <div key={f} className="auth-feature-item">
                                    <span className="auth-feature-dot" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div className="auth-form-panel">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <h2 className="auth-card-title">Create your account</h2>
                            <p className="auth-card-subtitle">Start managing leads in minutes</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form" id="signup-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="signup-name">Full name</label>
                                <div className="auth-input-wrap">
                                    <UserRound className="auth-input-icon" />
                                    <input
                                        id="signup-name"
                                        type="text"
                                        className="auth-input"
                                        placeholder="Jane Smith"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="name"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="signup-email">Email address</label>
                                <div className="auth-input-wrap">
                                    <Mail className="auth-input-icon" />
                                    <input
                                        id="signup-email"
                                        type="email"
                                        className="auth-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="signup-password">Password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" />
                                    <input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        className="auth-input auth-input-pw"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="auth-pw-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        tabIndex={-1}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="auth-strength-row">
                                        <div className="auth-strength-bars">
                                            {[1, 2, 3, 4].map((n) => (
                                                <div
                                                    key={n}
                                                    className={`auth-strength-bar ${strength >= n ? strengthClass : ""}`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`auth-strength-label ${strengthClass}`}>{strengthLabel}</span>
                                    </div>
                                )}
                            </div>

                            <div className="auth-field">
                                <label className="auth-label" htmlFor="signup-confirm">Confirm password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" />
                                    <input
                                        id="signup-confirm"
                                        type={showConfirm ? "text" : "password"}
                                        className="auth-input auth-input-pw"
                                        placeholder="••••••••"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="auth-pw-toggle"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        tabIndex={-1}
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                id="signup-submit"
                                type="submit"
                                className="auth-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
