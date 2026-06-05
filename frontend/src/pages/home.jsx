import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <div className="homePage">
            <header className="homeNavbar">
                <div className="brand">
                    <h2>VibeMeet</h2>
                    <p className="brandTagline">Professional meeting rooms for every team.</p>
                </div>

                <div className="navActions">
                    <Button
                        className="historyButton"
                        variant="outlined"
                        startIcon={<RestoreIcon />}
                        onClick={() => navigate("/history")}
                    >
                        History
                    </Button>

                    <Button
                        className="logoutButton"
                        variant="contained"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <main className="meetContainer">
                <section className="leftPanel">
                    <div className="heroCard">
                        <p className="eyebrowText">Team Collaboration</p>
                        <h2>Secure video calls built for reliability and clarity.</h2>
                        <p className="heroCopy">Start or join a meeting instantly with a secure access code. Enjoy crisp audio, fast connection, and a polished experience for every call.</p>

                        <div className="meetingForm">
                            <TextField
                                fullWidth
                                onChange={e => setMeetingCode(e.target.value)}
                                id="outlined-basic"
                                label="Meeting Code"
                                variant="outlined"
                            />
                            <Button className="joinButton" onClick={handleJoinVideoCall} variant='contained'>Join</Button>
                        </div>
                    </div>
                </section>

                <section className='rightPanel'>
                    <div className="heroIllustration">
                        <img srcSet='/logo3.png' alt="VibeMeet illustration" />
                    </div>
                </section>
            </main>
        </div>
    )
}

export default withAuth(HomeComponent)