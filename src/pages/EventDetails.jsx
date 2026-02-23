import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvents } from '../context/EventsContext';
import NextEventHero from '../components/Events/NextEventHero';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, loading } = useEvents();
  const [event, setEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const foundEvent = events.find(e => String(e.id) === String(id));
    if (foundEvent) {
      setEvent(foundEvent);
      setNotFound(false);
    } else if (!loading) {
      // Only mark as not found once loading is complete
      setNotFound(true);
    }
  }, [id, events, loading]);

  // Still loading — show skeleton
  if (loading || (!event && !notFound)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/50 text-sm font-bold uppercase tracking-widest">Loading Event...</p>
        </div>
      </div>
    );
  }

  // Event not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-hbm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-black text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-black text-gray-700 mb-6">Event Not Found</h1>
          <button onClick={() => navigate('/events')} className="bg-[#6160AB] text-white px-8 py-3 rounded-full font-bold hover:bg-[#5150aa] transition-all">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${event.title?.en || event.title} | The HBM`} 
        description={event.description?.en || event.description} 
      />
      {/* Back Button Overlay */}
      <div className="fixed top-24 left-6 z-50">
        <button 
            onClick={() => navigate('/events')} 
            className="bg-black/20 backdrop-blur-md border border-white/10 text-white p-3 rounded-full hover:bg-white/10 transition-all group"
        >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <NextEventHero event={event} />
    </>
  );
};

export default EventDetails;

