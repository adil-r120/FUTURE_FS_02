import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.error || "Login failed.");
        }
    };

    const fillDemo = () => {
        setEmail("demo@leadcrm.io");
        setPassword("Demo@1234");
    };

    return (
        <div className="auth-page">
            {/* Animated background blobs */}
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />
            <div className="auth-blob auth-blob-3" />

            <div className="auth-container">
                {/* Left panel — branding */}
                <div className="auth-brand-panel">
                    <div className="auth-brand-inner">
                        <div className="auth-logo">
                            <img src="/logo.png" alt="Lead CRM Logo" className="auth-logo-img" />
                        </div>
                        <h1 className="auth-brand-title">Lead CRM</h1>
                        <p className="auth-brand-tagline">
                            Manage your client pipeline with clarity and confidence.
                        </p>
                        <div className="auth-features">
                            {[
                                "Track every lead in one place",
                                "Visualise your pipeline instantly",
                                "Never miss a follow-up again",
                            ].map((f) => (
                                <div key={f} className="auth-feature-item">
                                    <span className="auth-feature-dot" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="auth-form-panel">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <h2 className="auth-card-title">Welcome back</h2>
                            <p className="auth-card-subtitle">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form" id="login-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="login-email">Email address</label>
                                <div className="auth-input-wrap">
                                    <Mail className="auth-input-icon" />
                                    <input
                                        id="login-email"
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
                                <label className="auth-label" htmlFor="login-password">Password</label>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        className="auth-input auth-input-pw"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
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
                            </div>

                            {error && (
                                <div className="auth-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                id="login-submit"
                                type="submit"
                                className="auth-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="auth-btn-ghost"
                                onClick={fillDemo}
                                disabled={loading}
                            >
                                Use demo credentials
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don't have an account?{" "}
                            <Link to="/signup" className="auth-link">
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
