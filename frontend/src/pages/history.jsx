import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import "../App.css"

export default function History() {
    const { getHistoryOfUser, addToUserHistory } = useContext(AuthContext)
    const [meetings, setMeetings] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser()
                // Sort by date descending
                const sortedHistory = (history || []).sort((a, b) => new Date(b.date) - new Date(a.date))
                setMeetings(sortedHistory)
            } catch (error) {
                console.error("Failed to fetch history", error)
            }
        }
        fetchHistory()
    }, [getHistoryOfUser])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleRejoin = async (code) => {
        try {
            await addToUserHistory(code)
            navigate(`/${code}`)
        } catch (error) {
            navigate(`/${code}`)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/auth")
    }

    const latestSession = meetings[0]

    return (
        <div className="historyPageContainer select-none min-h-screen relative text-on-surface bg-background overflow-x-hidden font-body-md">
            {/* Background ambiance */}
            <div className="aurora-bg"></div>

            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                <div className="w-full px-4 sm:px-6 md:px-16 py-3 sm:py-0 min-h-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/home")}>
                        <img src="/logo.png" alt="VibeMeet Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-xl font-bold text-on-surface tracking-tight">VibeMeet</span>
                    </div>

                    {/* Nav Links */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-8">
                        <button
                            className="bg-transparent border-0 text-on-surface-variant hover:text-primary transition-colors font-semibold text-sm flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
                            onClick={() => navigate("/home")}
                        >
                            Home
                        </button>
                        <button
                            className="bg-transparent border-0 text-primary border-b-2 border-primary pb-1 font-semibold text-sm flex items-center gap-2 cursor-pointer py-1.5 px-3"
                            onClick={() => navigate("/history")}
                        >
                            History
                        </button>
                        <button
                            className="bg-transparent border-0 text-on-surface-variant hover:text-red-400 transition-colors font-semibold text-sm flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-red-500/10"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 md:px-16 max-w-[1280px] mx-auto">
                {/* Page Header */}
                <header className="mb-12 text-center sm:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">Meeting History</h1>
                    <p className="text-base text-on-surface-variant leading-relaxed">Review your past connections and professional session durations.</p>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
                    {/* Latest Session Card */}
                    <div className="md:col-span-8 glass-card rounded-2xl p-5 sm:p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden group shadow-xl border border-white/5">
                        <div className="relative z-10 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/20">LATEST SESSION</span>
                            </div>
                            {latestSession ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4 uppercase tracking-wider">{latestSession.meetingCode}</h2>
                                    <div className="flex flex-wrap gap-6 text-on-surface-variant text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                                            <span>{formatDate(latestSession.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                                            <span>{formatTime(latestSession.date)}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl md:text-2xl font-bold text-on-surface-variant mb-4">No recent sessions</h2>
                                    <p className="text-sm text-on-surface-variant">Your completed sessions will appear here as soon as you connect.</p>
                                </>
                            )}
                        </div>

                        {latestSession && (
                            <div className="mt-8 relative z-10 text-left">
                                <button
                                    onClick={() => handleRejoin(latestSession.meetingCode)}
                                    className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all bg-transparent border-0 cursor-pointer p-0 text-sm"
                                >
                                    Rejoin Session <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Metric Card */}
                    <div className="md:col-span-4 glass-card rounded-2xl p-5 sm:p-8 flex flex-col justify-center items-center text-center shadow-xl border border-white/5 bg-surface-container-high/40">
                        <div className="w-16 h-16 rounded-2xl obsidian-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[32px] text-white">timer</span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-1">Total Activity</h3>
                        <div className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2">{meetings.length}</div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SESSIONS COMPLETED</p>
                    </div>

                    {/* Full List Section */}
                    <div className="md:col-span-12 mt-8 text-left">
                        <h3 className="text-lg font-bold text-on-surface mb-4">All Archives</h3>
                        <div className="flex flex-col gap-3">
                            {meetings.length > 0 ? (
                                meetings.map((meeting, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleRejoin(meeting.meetingCode)}
                                        className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer border border-white/5 hover:border-primary/20"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                                                <span className="material-symbols-outlined">groups</span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors uppercase tracking-wider">{meeting.meetingCode}</h4>
                                                <p className="text-xs text-on-surface-variant">{formatDate(meeting.date)} • {formatTime(meeting.date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 self-end md:self-auto">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRejoin(meeting.meetingCode); }}
                                                className="py-2 px-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer"
                                            >
                                                Rejoin
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="glass-card rounded-xl p-10 text-center border border-dashed border-white/10 bg-white/5">
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3">history_toggle_off</span>
                                    <h4 className="text-base font-bold text-on-surface mb-1">No history available</h4>
                                    <p className="text-xs text-on-surface-variant">Join or start a meeting to save your session logs automatically.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>


        </div>
    )
}
