import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { eventsConfig as fallbackEvents } from "../data/eventsConfig";
import { getApiBase } from "../utils/api";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = `${getApiBase()}/api/events`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setEvents(data);
        }
      } catch (error) {
        console.warn(
          "Could not fetch live events, using build-time data.",
          error,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const value = useMemo(
    () => ({ events, setEvents, loading }),
    [events, loading],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
