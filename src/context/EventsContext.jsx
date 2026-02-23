import React, { createContext, useContext, useState, useEffect } from 'react';
import { eventsConfig as fallbackEvents } from '../data/eventsConfig';

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState(fallbackEvents);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // In production, we fetch from the server API
                // In dev, we can also fetch if the admin server is running
                const apiUrl = import.meta.env.DEV ? `http://${window.location.hostname}:3001/api/events` : '/api/events';
                
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setEvents(data);
                    }
                }
            } catch (error) {
                console.warn("Could not fetch live events, using build-time data.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <EventsContext.Provider value={{ events, setEvents, loading }}>
            {children}
        </EventsContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};
