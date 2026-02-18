import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsConfig } from '../data/eventsConfig';
import NextEventHero from '../components/Events/NextEventHero';
import { ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Find event by ID
    // ID in URL might be string or number, check both
    const foundEvent = eventsConfig.find(e => String(e.id) === id);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      // Setup redirect or not found
      // For now just back to events
      navigate('/events');
    }
  }, [id, navigate]);

  if (!event) return <div className="min-h-screen bg-black" />;

  return (
    <>
      <SEO 
        title={`${event.title.en || event.title} | The HBM`} 
        description={event.description.en || event.description} 
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
