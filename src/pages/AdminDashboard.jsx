import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Edit3, Trash2, Plus, GripVertical, Image as ImageIcon, Video,
  Settings, Save, Eye, CheckCircle, Upload, Copy, Play, X, ExternalLink, ArrowRight,
  Sun, Droplets, Contrast, Heart, History, Users, Star, ArrowLeft
} from 'lucide-react';
import VisualEventEditor from '../components/Admin/VisualEventEditor';

// Helper for Lucide icons dynamic rendering if needed
const LucideIcon = ({ name, ...props }) => {
  const Icon = { Calendar, History, Edit3, Trash2, ExternalLink, Plus, Heart }[name];
  return Icon ? <Icon {...props} /> : null;
};
import { eventsConfig as initialEvents } from '../data/eventsConfig';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [events, setEvents] = useState(initialEvents);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [registrationsList, setRegistrationsList] = useState([]);
  
  // Tabs for better data organization
  const [activeTab, setActiveTab] = useState('essentials'); // essentials, media, content, settings, registrations

  useEffect(() => {
    fetch('http://localhost:3001/api/registrations/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats fetch error:", err));

    fetch('http://localhost:3001/api/registrations')
        .then(res => res.json())
        .then(data => setRegistrationsList(data))
        .catch(err => console.error("Registrations fetch error:", err));
  }, []);

  // Authentication
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'hbm2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  // CRUD Operations
  const handleEdit = (event) => {
    setCurrentEvent(event);
    setIsEditing(true);
    // Reset to first tab
    setActiveTab('essentials');
    if (event.folderName) {
        fetchGalleryImages(event.folderName);
    } else {
        setGalleryImages([]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      saveToBackend(updatedEvents);
    }
  };

  const handleDuplicate = (event) => {
    const newId = Math.max(...events.map(e => Number(e.id) || 0)) + 1;
    const duplicatedEvent = {
        ...event,
        id: newId,
        title: { 
            en: `Copy of ${event.title.en || event.title}`, 
            he: event.title.he 
        },
        status: 'draft' // Default to draft
    };
    const updatedEvents = [duplicatedEvent, ...events];
    setEvents(updatedEvents);
    saveToBackend(updatedEvents);
    handleEdit(duplicatedEvent);
  };

  const handleAddNew = () => {
    const newId = Math.max(...events.map(e => Number(e.id) || 0)) + 1;
    setCurrentEvent({
      id: newId,
      title: { en: '', he: '' },
      date: '', 
      description: { en: '', he: '' },
      location: '',
      type: 'Face to Face',
      image: '',
      folderName: '',
      imageCount: 0,
      registrationLink: '',
      gallery: [],
      participants: 0,
      tags: [],
      status: 'draft',
      // New Fields Defaults
      heroVideo: '',
      partners: [],
      faqs: [],
      highlights: [],
      socialProof: { capacity: 50, attendingCount: 0 },
      hostNote: { message: '', author: 'The HBM Team' },
      locationParams: { addressText: '', googleMapsEmbedUrl: '' },
      registration: { status: 'open', externalUrl: '', whatsappLink: '' }
    });
    setGalleryImages([]);
    setIsEditing(true);
    setActiveTab('essentials');
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    let updatedEvents;
    
    // Auto-update imageCount based on actual files if folder exists
    const eventToSave = {
        ...currentEvent,
        imageCount: galleryImages.length 
    };
    
    if (events.find(ev => ev.id === eventToSave.id)) {
        updatedEvents = events.map(ev => ev.id === eventToSave.id ? eventToSave : ev);
    } else {
        updatedEvents = [eventToSave, ...events];
    }
    
    updatedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    setEvents(updatedEvents);
    setIsEditing(false);
    saveToBackend(updatedEvents);
  };

  const saveToBackend = async (data) => {
    setSaveStatus('Saving...');
    try {
      const response = await fetch('http://localhost:3001/api/save-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: data }),
      });
      
      const result = await response.json();
      if (result.success) {
        setSaveStatus('Saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error saving: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error: Ensure admin-server is running!');
    }
  };

  // Gallery Management
  const fetchGalleryImages = async (folderName) => {
      try {
          const res = await fetch(`http://localhost:3001/api/images/${folderName}`);
          const data = await res.json();
          setGalleryImages(data.images || []);
      } catch (err) {
          console.error("Failed to fetch images", err);
      }
  };

  const handleImageUpload = async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0 || !currentEvent.folderName) {
          alert("Please specify a Folder Name first and select files!");
          return;
      }

      const formData = new FormData();
      formData.append('folderName', currentEvent.folderName);
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      setUploading(true);
      try {
          const res = await fetch('http://localhost:3001/api/upload-image', {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.success) {
              await fetchGalleryImages(currentEvent.folderName);
              
              // Auto-Sync Count
              const countRes = await fetch(`http://localhost:3001/api/images/${currentEvent.folderName}`);
              const countData = await countRes.json();
              const newCount = countData.images ? countData.images.length : 0;
              
              const updatedEvent = { ...currentEvent, imageCount: newCount };
              setCurrentEvent(updatedEvent);

              const updatedEventsList = events.map(ev => ev.id === currentEvent.id ? updatedEvent : ev);
              setEvents(updatedEventsList);
              saveToBackend(updatedEventsList);

          } else {
              alert('Upload failed: ' + data.error);
          }
      } catch (err) {
          console.error(err);
          alert('Upload failed');
      } finally {
          setUploading(false);
          e.target.value = '';
      }
  };

  const handleDeleteImage = async (filename) => {
      if(!window.confirm(`Delete ${filename}?`)) return;
      try {
          const res = await fetch('http://localhost:3001/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ folderName: currentEvent.folderName, filename })
          });
          const data = await res.json();
          if(data.success) {
              await fetchGalleryImages(currentEvent.folderName);
              
              // Auto-Sync Count
              const countRes = await fetch(`http://localhost:3001/api/images/${currentEvent.folderName}`);
              const countData = await countRes.json();
              const newCount = countData.images ? countData.images.length : 0;
              
              const updatedEvent = { ...currentEvent, imageCount: newCount };
              setCurrentEvent(updatedEvent);

              const updatedEventsList = events.map(ev => ev.id === currentEvent.id ? updatedEvent : ev);
              setEvents(updatedEventsList);
              saveToBackend(updatedEventsList);
          }
      } catch (err) {
          console.error(err);
      }
  };

  // Asset Upload (Video/Partners)
  const handleAssetUpload = async (e, type) => {
      const file = e.target.files[0];
      if (!file || !currentEvent.folderName) return alert("Folder Name required!");
      
      const formData = new FormData();
      formData.append('folderName', currentEvent.folderName);
      if (type === 'partners') formData.append('subfolder', 'partners');
      formData.append('asset', file);

      try {
          const res = await fetch('http://localhost:3001/api/upload-asset', {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.success) {
              if (type === 'hero') handleChange('heroVideo', `/assets/events/${currentEvent.folderName}/${data.filename}`);
              if (type === 'thumbnail') handleChange('thumbnail', `/assets/events/${currentEvent.folderName}/${data.filename}`);
              if (type === 'image') handleChange('image', `/assets/events/${currentEvent.folderName}/${data.filename}`); // Explicit hero image upload if needed
              
              if (type === 'partners') {
                  const newPartner = { name: 'New Partner', logo: `/assets/events/${currentEvent.folderName}/${data.path}`, website: '' };
                  const updatedPartners = [...(currentEvent.partners || []), newPartner];
                  handleChange('partners', updatedPartners);
              }
          }
      } catch (err) {
          console.error("Asset upload failed", err);
      }
  };

  // Helper for inputs
  const handleChange = (field, value, lang = null) => {
    if (lang) {
      setCurrentEvent(prev => ({
        ...prev,
        [field]: { ...prev[field], [lang]: value }
      }));
    } else {
      setCurrentEvent(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Nested Change Helper
  const handleNestedChange = (parent, field, value) => {
      setCurrentEvent(prev => ({
          ...prev,
          [parent]: { ...(prev[parent] || {}), [field]: value }
      }));
  };

  // Array Managers
  const handleArrayChange = (field, index, subfield, value) => {
      const newArray = [...(currentEvent[field] || [])];
      newArray[index] = { ...newArray[index], [subfield]: value };
      handleChange(field, newArray);
  };
  
  const addArrayItem = (field, template) => {
      handleChange(field, [...(currentEvent[field] || []), template]);
  };
  
  const removeArrayItem = (field, index) => {
      const newArray = [...(currentEvent[field] || [])];
      newArray.splice(index, 1);
      handleChange(field, newArray);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full p-3 border rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FE] to-[#E2E6F2] p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
               <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6160AB] to-[#F07B3C] tracking-tight">
                   <span className="flex items-center gap-3"><Heart className="w-8 h-8 fill-[#6160AB] text-[#6160AB]" /> Event Manager</span>
               </h1>
              <p className="text-gray-500 mt-1 font-medium ml-11">Create, manage, and track your experiences.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/60">
             <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-purple-600 font-bold transition-colors text-sm">
                <ExternalLink className="w-4 h-4" /> View Live Site
             </a>
             <div className="w-px h-6 bg-gray-300"></div>
             {saveStatus && <span className={`font-bold text-sm px-3 py-1 rounded-full ${saveStatus.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{saveStatus}</span>}
             <button onClick={handleAddNew} className="bg-gradient-to-r from-[#6160AB] to-[#F07B3C] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Palette className="w-4 h-4" /> New Experience
             </button>
          </div>
        </div>

        {isEditing && currentEvent ? (
          <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                 <div className="flex items-center gap-4">
                     <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg">
                        <ArrowLeft className="w-4 h-4" /> Back to All Events
                     </button>
                     <div className="h-6 w-px bg-gray-300"></div>
                     <h2 className="text-2xl font-bold text-gray-800">{events.find(e => e.id === currentEvent.id) ? 'Edit Event' : 'New Event'}</h2>
                     <span className="text-gray-400 text-sm font-mono bg-gray-100 px-2 py-1 rounded">ID: {currentEvent.id}</span>
                     
                     {/* Status Toggle */}
                     <div className="flex items-center gap-2 ml-4 bg-gray-100 p-1 rounded-lg">
                         <button 
                            type="button"
                            onClick={() => handleChange('status', 'draft')}
                            className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${currentEvent.status === 'draft' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                             Draft
                         </button>
                         <button 
                            type="button"
                            onClick={() => handleChange('status', 'published')}
                            className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${currentEvent.status === 'published' ? 'bg-green-100 text-green-700 shadow' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                             Live
                         </button>
                     </div>

                     {/* Live Preview Button */}
                     <a href={`/events/${currentEvent.id}`} target="_blank" className="ml-4 flex items-center gap-2 text-purple-600 bg-purple-50 px-3 py-2 rounded-lg font-bold text-sm hover:bg-purple-100 transition-colors">
                         <Eye className="w-4 h-4" /> Preview Page
                     </a>
                 </div>
                 <div className="flex gap-2">
                     {['essentials', 'media', 'content', 'settings', 'registrations'].map(tab => (
                         <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                         >
                             {tab}
                         </button>
                     ))}
                 </div>
            </div>

            <form onSubmit={handleSaveEvent} className="p-8">
                
                {activeTab === 'essentials' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Title (EN)</label>
                            <input type="text" value={currentEvent.title.en || currentEvent.title} onChange={e => handleChange('title', e.target.value, 'en')} className="w-full p-3 border rounded" required />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-2">Title (HE)</label>
                           <input type="text" value={currentEvent.title.he || ''} onChange={e => handleChange('title', e.target.value, 'he')} className="w-full p-3 border rounded text-right" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Date & Time</label>
                            <input type="datetime-local" value={currentEvent.date} onChange={e => handleChange('date', e.target.value)} className="w-full p-3 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Location Name</label>
                            <input type="text" value={currentEvent.location} onChange={e => handleChange('location', e.target.value)} className="w-full p-3 border rounded" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-sm font-bold mb-2">Google Maps Embed URL</label>
                             <input type="text" value={currentEvent.locationParams?.googleMapsEmbedUrl || ''} onChange={e => handleNestedChange('locationParams', 'googleMapsEmbedUrl', e.target.value)} className="w-full p-3 border rounded font-mono text-xs text-gray-600" placeholder="https://www.google.com/maps/embed?..." />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold mb-2">Description (EN)</label>
                            <textarea value={currentEvent.description.en || currentEvent.description} onChange={e => handleChange('description', e.target.value, 'en')} className="w-full p-3 border rounded h-24" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold mb-2">Description (HE)</label>
                            <textarea value={currentEvent.description.he || ''} onChange={e => handleChange('description', e.target.value, 'he')} className="w-full p-3 border rounded h-24 text-right" />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-sm font-bold mb-2">Folder Name (Required for Media)</label>
                             <input type="text" value={currentEvent.folderName || ''} onChange={e => handleChange('folderName', e.target.value)} className="w-full p-3 border rounded bg-yellow-50" placeholder="e.g. march-26" />
                        </div>
                    </div>
                )}

                {activeTab === 'registrations' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Analytics Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">Total Registrations</h3>
                                <p className="text-4xl font-extrabold text-blue-600">
                                    {Object.values(stats).reduce((a, b) => a + b, 0)}
                                </p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <h3 className="text-gray-500 font-bold text-sm uppercase mb-2">For This Event</h3>
                                <p className="text-4xl font-extrabold text-purple-600">
                                    {stats[currentEvent.id] || 0}
                                </p>
                            </div>
                        </div>

                         {/* Source Breakdown */}
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-4">Discovery Source</h3>
                            <div className="space-y-3">
                                {(() => {
                                    const eventRegs = registrationsList.filter(r => (r.eventId?.toString() === currentEvent.id?.toString()) || (r.eventId === 'general' && currentEvent.id === 'general'));
                                    const total = eventRegs.length;
                                    if (total === 0) return <p className="text-gray-400">No data yet.</p>;

                                    const sources = eventRegs.reduce((acc, curr) => {
                                        const s = curr.source || 'unknown';
                                        acc[s] = (acc[s] || 0) + 1;
                                        return acc;
                                    }, {});

                                    return Object.entries(sources).map(([source, count]) => {
                                        const percentage = Math.round((count / total) * 100);
                                        return (
                                            <div key={source}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700 capitalize">{source.replace(/_/g, ' ')}</span>
                                                    <span className="text-gray-500">{percentage}% ({count})</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Recent Registrations Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h3 className="font-bold text-gray-700">Recent Registrations</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Source</th>
                                            <th className="px-6 py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrationsList
                                            .filter(r => (r.eventId?.toString() === currentEvent.id?.toString()))
                                            .slice().reverse().slice(0, 10) // Last 10
                                            .map((reg, idx) => (
                                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{reg.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{reg.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded capitalize">
                                                        {reg.source || 'unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {new Date(reg.date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {registrationsList.filter(r => (r.eventId?.toString() === currentEvent.id?.toString())).length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                                    No registrations found for this event.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* VISUAL SLIDERS */}
                        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-purple-600" /> Hero Visuals
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Brightness ({currentEvent.heroStyle?.brightness || 100}%)</label>
                                    <input 
                                        type="range" 
                                        min="20" 
                                        max="150" 
                                        value={currentEvent.heroStyle?.brightness || 100} 
                                        onChange={e => handleNestedChange('heroStyle', 'brightness', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Overlay Opacity ({currentEvent.heroStyle?.overlayOpacity ?? 50}%)</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="90" 
                                        value={currentEvent.heroStyle?.overlayOpacity ?? 50} 
                                        onChange={e => handleNestedChange('heroStyle', 'overlayOpacity', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Blur ({currentEvent.heroStyle?.blur || 0}px)</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="20" 
                                        value={currentEvent.heroStyle?.blur || 0} 
                                        onChange={e => handleNestedChange('heroStyle', 'blur', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Thumbnail URL (List View)</label>
                            <div className="flex gap-4 items-center">
                                <input type="text" value={currentEvent.thumbnail || ''} onChange={e => handleChange('thumbnail', e.target.value)} className="flex-1 p-3 border rounded" placeholder="/assets/events/.../thumb.jpg" />
                                <label className="cursor-pointer bg-gray-200 px-4 py-3 rounded-lg font-bold hover:bg-gray-300">
                                    Upload Thumb
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'thumbnail')} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Small image for the events list card.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Hero Image URL (Details Page)</label>
                            <input type="text" value={currentEvent.image} onChange={e => handleChange('image', e.target.value)} className="w-full p-3 border rounded" placeholder="/assets/events/.../hero.jpg" />
                        </div>
                        
                        {/* Hero Video */}
                        <div className="bg-gray-900 text-white p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Video className="w-5 h-5"/> Hero Video (Luma Style)</h3>
                            <div className="flex gap-4 items-center">
                                <input type="text" value={currentEvent.heroVideo || ''} onChange={e => handleChange('heroVideo', e.target.value)} className="flex-1 p-3 border rounded text-black" placeholder="/assets/events/.../hero.mp4" />
                                <label className="cursor-pointer bg-blue-600 px-4 py-3 rounded-lg font-bold hover:bg-blue-700">
                                    Upload .mp4
                                    <input type="file" className="hidden" accept="video/mp4" onChange={e => handleAssetUpload(e, 'hero')} />
                                </label>
                            </div>
                        </div>

                        {/* Gallery Manager */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5" /> Gallery Manager</h3>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-gray-500">{galleryImages.length} images found in folder</p>
                                <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
                                    {uploading ? 'Uploading...' : 'Bulk Upload Images'}
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                            {galleryImages.length > 0 ? (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                            <img src={`/assets/events/${currentEvent.folderName}/${img}`} className="w-full h-full object-cover" alt="" />
                                            <button onClick={() => handleDeleteImage(img)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">No images yet. Upload some!</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Highlights */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-orange-500"/> Event Highlights</h3>
                                <button type="button" onClick={() => addArrayItem('highlights', {title: 'New Feature', description: 'Description'})} className="text-blue-600 font-bold text-sm">+ Add Highlight</button>
                            </div>
                            {(currentEvent.highlights || []).map((item, idx) => (
                                <div key={idx} className="flex gap-4 mb-3 items-start bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <div className="flex-1 space-y-2">
                                        <input type="text" placeholder="Title (e.g., Wine Bar)" value={item.title} onChange={e => handleArrayChange('highlights', idx, 'title', e.target.value)} className="w-full p-2 border rounded font-bold text-sm" />
                                        <input type="text" placeholder="Description" value={item.description} onChange={e => handleArrayChange('highlights', idx, 'description', e.target.value)} className="w-full p-2 border rounded text-xs" />
                                    </div>
                                    <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>

                        {/* Partners */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> Partners</h3>
                                <button type="button" onClick={() => addArrayItem('partners', { name: '', logo: '' })} className="text-blue-600 font-bold text-sm">+ Add Partner</button>
                             </div>
                             
                             {/* Partner Upload Helper */}
                             <label className="cursor-pointer bg-white border border-dashed border-gray-300 text-gray-600 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-4 hover:bg-gray-50 transition-colors">
                                <Upload className="w-4 h-4" /> Upload Partner Logo to Assets
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'partners')} disabled={!currentEvent.folderName} />
                             </label>

                             {(currentEvent.partners || []).map((item, idx) => (
                                 <div key={idx} className="flex gap-4 mb-3 items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                     <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center overflow-hidden flex-shrink-0">
                                         {item.logo ? <img src={item.logo} className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">No Logo</span>}
                                     </div>
                                     <div className="flex-1 space-y-1">
                                         <input type="text" placeholder="Partner Name" value={item.name} onChange={e => handleArrayChange('partners', idx, 'name', e.target.value)} className="w-full p-2 border rounded text-sm font-bold" />
                                         <input type="text" placeholder="Logo URL" value={item.logo} onChange={e => handleArrayChange('partners', idx, 'logo', e.target.value)} className="w-full p-1 border rounded text-xs text-gray-400" />
                                     </div>
                                     <button type="button" onClick={() => removeArrayItem('partners', idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                             ))}
                        </div>

                        {/* FAQs */}
                         <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5"/> FAQs</h3>
                            {(currentEvent.faqs || []).map((item, idx) => (
                                <div key={idx} className="flex gap-4 mb-2">
                                    <input type="text" placeholder="Question" value={item.question} onChange={e => handleArrayChange('faqs', idx, 'question', e.target.value)} className="w-1/3 p-2 border rounded" />
                                    <input type="text" placeholder="Answer" value={item.answer} onChange={e => handleArrayChange('faqs', idx, 'answer', e.target.value)} className="w-1/2 p-2 border rounded" />
                                    <button type="button" onClick={() => removeArrayItem('faqs', idx)} className="text-red-500"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addArrayItem('faqs', {question: '', answer: ''})} className="text-blue-600 font-bold text-sm">+ Add FAQ</button>
                        </div>
                        
                        {/* Host Note */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <h3 className="font-bold mb-2">Host Note</h3>
                             <textarea placeholder="Message from host..." value={currentEvent.hostNote?.message || ''} onChange={e => handleNestedChange('hostNote', 'message', e.target.value)} className="w-full p-2 border rounded mb-2" />
                             <input type="text" placeholder="Author Name" value={currentEvent.hostNote?.author || ''} onChange={e => handleNestedChange('hostNote', 'author', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                )}
                
                {activeTab === 'settings' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                         {/* Status & Registration */}
                         <div className="grid grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-bold mb-2">Event Status</label>
                                 <select value={currentEvent.status || 'published'} onChange={e => handleChange('status', e.target.value)} className="w-full p-3 border rounded">
                                     <option value="published">Published (Visible)</option>
                                     <option value="draft">Draft (Hidden)</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold mb-2">Registration Status</label>
                                 <select value={currentEvent.registration?.status || 'open'} onChange={e => handleNestedChange('registration', 'status', e.target.value)} className="w-full p-3 border rounded">
                                     <option value="open">Open</option>
                                     <option value="closed">Closed</option>
                                     <option value="waitlist">Waitlist</option>
                                 </select>
                             </div>
                         </div>
                         
                         {/* Social Proof */}
                         <div className="grid grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-sm font-bold mb-2">Total Capacity</label>
                                 <input type="number" value={currentEvent.socialProof?.capacity || 50} onChange={e => handleNestedChange('socialProof', 'capacity', Number(e.target.value))} className="w-full p-3 border rounded" />
                             </div>
                              <div>
                                 <label className="block text-sm font-bold mb-2">Current Attendees (Fake/Real)</label>
                                 <input type="number" value={currentEvent.socialProof?.attendingCount || 0} onChange={e => handleNestedChange('socialProof', 'attendingCount', Number(e.target.value))} className="w-full p-3 border rounded" />
                             </div>
                         </div>

                         {/* Partners */}
                         <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> Partners</h3>
                            <label className="cursor-pointer bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold inline-block mb-4">
                                + Upload Partner Logo
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'partners')} disabled={!currentEvent.folderName} />
                            </label>
                            
                            {(currentEvent.partners || []).map((item, idx) => (
                                <div key={idx} className="flex gap-4 mb-2 items-center bg-gray-50 p-2 rounded">
                                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                                        {item.logo && <img src={item.logo} className="w-full h-full object-cover" />}
                                    </div>
                                    <input type="text" placeholder="Partner Name" value={item.name} onChange={e => handleArrayChange('partners', idx, 'name', e.target.value)} className="flex-1 p-2 border rounded" />
                                    <input type="text" placeholder="Website" value={item.website} onChange={e => handleArrayChange('partners', idx, 'website', e.target.value)} className="flex-1 p-2 border rounded" />
                                    <button type="button" onClick={() => removeArrayItem('partners', idx)} className="text-red-500"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        
                        {/* Location Details */}
                        <div>
                             <label className="block text-sm font-bold mb-2">Google Maps Embed URL</label>
                             <input type="text" value={currentEvent.locationParams?.googleMapsEmbedUrl || ''} onChange={e => handleNestedChange('locationParams', 'googleMapsEmbedUrl', e.target.value)} className="w-full p-3 border rounded font-mono text-xs" />
                        </div>
                     </div>
                )}


                <div className="mt-8 pt-6 border-t flex gap-4">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        <Save className="w-5 h-5" /> Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-bold">Cancel</button>
                </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.filter(e => e.status !== 'draft' || true).map(event => (
              <motion.div 
                key={event.id} 
                layoutId={event.id}
                className={`relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/50 group hover:shadow-2xl transition-all duration-300 ${event.status === 'draft' ? 'opacity-75 border-dashed border-gray-400' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Visual Header */}
                <div className="relative h-48 overflow-hidden">
                     {event.heroVideo ? (
                          <video src={event.heroVideo} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" muted />
                     ) : (
                         <img src={event.thumbnail || event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                     
                     {/* Status Badge */}
                     <div className="absolute top-4 left-4 flex gap-2">
                        {event.status === 'draft' && <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">Draft</span>}
                        {new Date(event.date) < new Date() && <span className="bg-orange-500/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">Past Event</span>}
                     </div>

                     {/* Stats & Actions Overlay */}
                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                        <button onClick={() => window.open(`/events/${event.id}`, '_blank')} className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-purple-600 p-2 rounded-full transition-colors" title="Preview Live">
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(event)} className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-purple-600 p-2 rounded-full transition-colors" title="Duplicate">
                            <Copy className="w-4 h-4" />
                        </button>
                     </div>
                </div>

                {/* Content Body */}
                <div className="p-6 relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6160AB] to-[#F07B3C] mb-1">{event.title.en || event.title}</h3>
                             <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> {event.date} • {event.location}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">
                                <Users className="w-3 h-3" /> {stats[event.id] || 0}
                            </span>
                        </div>
                    </div>
                    
                    {/* HBM Heart Branding */}
                    <div className="absolute -bottom-4 -right-4 text-purple-500/10 transform rotate-12">
                        <Heart className="w-24 h-24 fill-current" />
                    </div>

                    <div className="mt-6 flex justify-between items-center relative z-10">
                        <button onClick={() => handleEdit(event)} className="bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:border-purple-200 px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Manage
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
