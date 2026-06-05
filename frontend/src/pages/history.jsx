import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext)
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate()

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser()
                setMeetings(history)
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory()
    }, [getHistoryOfUser])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    return (
        <div className="historyPageContainer">
            <nav className="landingPageNav">
                <div className="navHeader">
                    <h2>VibeMeet</h2>
                </div>
                <div className="navlist">
                    <p onClick={() => routeTo('/home')}>Home</p>
                    <p onClick={() => routeTo('/auth')}>Logout</p>
                </div>
            </nav>

            <section className="historyHero">
                <div>
                    <p className="eyebrowText">Meeting archive</p>
                    <h1>Keep your calls organized in one polished dashboard.</h1>
                    <p>Browse your recent meeting codes, revisit session dates, and jump back into calls with confidence.</p>
                </div>
                <Button className="historyHomeButton" variant="contained" onClick={() => routeTo('/home')}>Back to Home</Button>
            </section>

            <section className="historyCards">
                {meetings.length > 0 ? meetings.map((meeting, index) => (
                    <Card key={index} className="historyCard" variant="outlined">
                        <CardContent>
                            <div className="historyCardHeader">
                                <Typography variant="subtitle2" color="text.secondary">Meeting Code</Typography>
                                <Typography variant="h6">{meeting.meetingCode}</Typography>
                            </div>
                            <Typography color="text.secondary">Date: {formatDate(meeting.date)}</Typography>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="emptyHistory">
                        <Typography variant="h6">No history available</Typography>
                        <Typography color="text.secondary">Join a meeting to save your session history automatically.</Typography>
                    </div>
                )}
            </section>
        </div>
    )
}

