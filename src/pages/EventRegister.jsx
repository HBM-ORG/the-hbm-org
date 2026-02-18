import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventRegister = () => {
    const navigate = useNavigate();

    // Redirect to the events list or the specific next event if known
    // The new registration flow is inside NextEventHero on the details page
    useEffect(() => {
        navigate('/events');
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-hbm-cream">
            <p>Redirecting to events...</p>
        </div>
    );
};

export default EventRegister;
