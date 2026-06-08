import * as React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../styles/authentication.css';

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);

    // formState: 0 for Login, 1 for Register
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async (e) => {
        if (e) e.preventDefault();
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
                setName("");
            }
        } catch (err) {
            console.log(err);
            let message = err.response?.data?.message || "An error occurred";
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            {/* Navbar without Home and History */}
            <header className="auth-navbar">
                <div className="auth-logo" onClick={() => setFormState(0)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/logo.png" alt="VibeMeet Logo" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
                    VibeMeet
                </div>
                {formState === 0 ? (
                    <button className="auth-nav-btn" onClick={() => setFormState(1)}>
                        Register
                    </button>
                ) : (
                    <button className="auth-nav-btn" onClick={() => setFormState(0)}>
                        Login
                    </button>
                )}
            </header>

            {/* Auth Card Content */}
            <div className="auth-card-wrapper">
                <div className="auth-card">
                    <h1 className="auth-card-title">
                        {formState === 0 ? "Welcome Back" : "Join VibeMeet"}
                    </h1>
                    <p className="auth-card-subtitle">
                        Simple, friendly video calls for staying close.
                    </p>

                    <form className="auth-form" onSubmit={handleAuth}>
                        {formState === 1 && (
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="fullName">Full Name</label>
                                <div className="auth-input-wrapper">
                                    <input
                                        id="fullName"
                                        type="text"
                                        className="auth-input"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="username">Username</label>
                            <div className="auth-input-wrapper">
                                <input
                                    id="username"
                                    type="text"
                                    className="auth-input"
                                    placeholder={formState === 0 ? "Enter your username" : "Choose a username"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="password">Password</label>
                            <div className="auth-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder={formState === 0 ? "Enter your password" : "Create a strong password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <VisibilityOffIcon fontSize="small" />
                                    ) : (
                                        <VisibilityIcon fontSize="small" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <div className="auth-error-msg">{error}</div>}

                        <button type="submit" className="auth-submit-btn">
                            {formState === 0 ? "Login" : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-footer-text">
                        {formState === 0 ? (
                            <>
                                Don't have an account?{" "}
                                <span className="auth-footer-link" onClick={() => setFormState(1)}>
                                    Register
                                </span>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <span className="auth-footer-link" onClick={() => setFormState(0)}>
                                    Log in
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </div>
    );
}