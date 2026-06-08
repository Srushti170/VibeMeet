import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const generateMeetingCode = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        let code = "";
        for (let i = 0; i < 9; i++) {
            if (i === 3 || i === 6) code += "-";
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleStartNewMeeting = async () => {
        const code = generateMeetingCode();
        try {
            await addToUserHistory(code);
            navigate(`/${code}`);
        } catch (error) {
            console.error("Failed to add meeting to history", error);
            navigate(`/${code}`);
        }
    };

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        try {
            await addToUserHistory(meetingCode);
            navigate(`/${meetingCode}`);
        } catch (error) {
            console.error("Failed to add meeting to history", error);
            navigate(`/${meetingCode}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <div className="homePage select-none min-h-screen relative text-on-surface bg-background overflow-x-hidden font-body-md">
            {/* Background ambiance */}
            <div className="obsidian-bg"></div>

            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="max-w-[1280px] mx-auto px-6 md:px-16 h-16 flex justify-between items-center">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
                        <img src="/logo.png" alt="VibeMeet Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold text-on-surface tracking-tight">VibeMeet</span>
                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            className="bg-transparent border-0 text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
                            onClick={() => navigate("/history")}
                        >
                            <span className="material-symbols-outlined text-[18px]">history</span>
                            History
                        </button>
                        <button
                            className="bg-transparent border-0 text-on-surface-variant hover:text-red-400 transition-colors font-semibold text-sm flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative min-h-screen pt-32 pb-20 px-6 md:px-16 flex flex-col items-center">
                {/* Hero Section */}
                <div className="max-w-[1200px] w-full mb-16">
                    <div className="flex flex-col items-start gap-4 mb-8">

                        <h1 className="text-3xl md:text-4xl font-bold text-on-surface leading-tight max-w-3xl">
                            Connect, collaborate, and communicate in real time from anywhere.
                        </h1>
                        <p className="text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                            High-fidelity video infrastructure for secure global collaboration. Engineered for zero-latency professional environments.
                        </p>
                    </div>

                    {/* Main Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
                        {/* Start Meeting Card */}
                        <div className="nexus-card p-8 md:p-10 rounded-2xl flex flex-col items-start shadow-xl">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>video_call</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-3">New Meeting</h3>
                            <p className="text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">Deploy a dedicated encrypted session with one click.</p>
                            <button
                                onClick={handleStartNewMeeting}
                                className="w-full btn-obsidian py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/10"
                            >
                                Start Session
                            </button>
                        </div>

                        {/* Join with Code Card */}
                        <div className="nexus-card p-8 md:p-10 rounded-2xl flex flex-col items-start shadow-xl">
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
                                <span className="material-symbols-outlined text-secondary text-[28px]">keyboard</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-3">Join Meeting</h3>
                            <p className="text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">Enter a secure access code to enter an active room.</p>
                            <div className="w-full flex gap-3">
                                <input
                                    className="flex-1 bg-background border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary transition-all font-semibold uppercase tracking-wider text-sm"
                                    placeholder="CODE: abc-defg-hij"
                                    type="text"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoinVideoCall(); }}
                                />
                                <button
                                    onClick={handleJoinVideoCall}
                                    disabled={!meetingCode.trim()}
                                    className="w-12 h-12 bg-primary/10 border border-primary/20 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-primary flex items-center justify-center rounded-xl cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </main>



        </div>
    )
}

export default withAuth(HomeComponent)