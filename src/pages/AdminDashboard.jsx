import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Edit3, Trash2, Plus, GripVertical, Image as ImageIcon, Video,
  Contrast, Heart, History, Users, Star, ArrowLeft, Palette, HelpCircle, Download, Database, BarChart3,
  ExternalLink, Save, Copy, Settings, Eye, Upload, Mail, Smartphone, Monitor, Sparkles, CheckCircle2, AlertCircle, Wand2, Zap, X, MonitorPlay
} from 'lucide-react';
import VisualEventEditor from '../components/Admin/VisualEventEditor';
import EmailEngine from '../components/Admin/EmailEngine';
import { useEvents } from '../context/EventsContext';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { events: initialEvents, setEvents: setGlobalEvents } = useEvents();
  const [events, setEvents] = useState(initialEvents);
  const [isEditing, setIsEditing] = useState(false);
  const [isVisualEditing, setIsVisualEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({});
  const [registrationsList, setRegistrationsList] = useState([]);
  const [automationConfig, setAutomationConfig] = useState(null);
  const [emailEngineStatus, setEmailEngineStatus] = useState('loading'); // 'loading', 'online', 'error'
  const [videoEventConfig, setVideoEventConfig] = useState(null);
  const [activeFlowId, setActiveFlowId] = useState('registration_confirmed');
  const [previewDevice, setPreviewDevice] = useState('desktop'); 

  const [activeTab, setActiveTab] = useState('essentials'); 
  const [topView, setTopView] = useState('events'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');

  useEffect(() => {
    const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
    
    fetch(`${base}/api/registrations/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats fetch error:", err));

    fetch(`${base}/api/registrations`)
        .then(res => res.json())
        .then(data => setRegistrationsList(data))
        .catch(err => console.error("Registrations fetch error:", err));

    fetch(`${base}/api/automation-settings`)
        .then(res => {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(data => {
            setAutomationConfig(data);
            setEmailEngineStatus('online');
        })
        .catch(err => {
            console.error("Automation settings fetch error:", err);
            setEmailEngineStatus('error');
        });
        
    fetch(`${base}/api/video-event`)
        .then(res => res.json())
        .then(data => setVideoEventConfig(data))
        .catch(err => console.error("Video Event config fetch error:", err));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'hbm2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleEdit = (event, mode = 'standard') => {
    if (!event.folderName) {
        event.folderName = `event-${event.id}-${Date.now()}`;
    }
    setCurrentEvent(event);
    setIsEditing(true);
    setIsVisualEditing(mode === 'visual');
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
        status: 'draft'
    };
    const updatedEvents = [duplicatedEvent, ...events];
    setEvents(updatedEvents);
    saveToBackend(updatedEvents);
    handleEdit(duplicatedEvent);
  };

  const handleAddNew = () => {
    const newId = events.length > 0 ? Math.max(...events.map(e => Number(e.id) || 0)) + 1 : 1;
    const folderName = `event-${Date.now()}`;
    
    setCurrentEvent({
      id: newId,
      title: { en: 'New Event', he: 'אירוע חדש' },
      date: '2026-01-01',
      location: 'TBD',
      description: { en: 'Description here...', he: 'תיאור כאן...' },
      image: '',
      folderName: folderName,
      imageCount: 0,
      registrationLink: '',
      gallery: [],
      participants: 0,
      tags: [],
      status: 'draft',
      heroVideo: '',
      partners: [],
      faqs: [],
      highlights: [],
      socialProof: { capacity: 50, attendingCount: 0 },
      hostNote: { message: '', author: 'The HBM Team' },
      locationParams: { addressText: '', googleMapsEmbedUrl: '' },
      registration: { status: 'open', externalUrl: '', whatsappLink: '' },
      visuals: { brightness: 100, blur: 0, videoScale: 1 }
    });
    setGalleryImages([]);
    setIsEditing(true);
    setIsVisualEditing(false); 
    setActiveTab('essentials');
  };

  const handleSaveEvent = (e) => {
    if (e) e.preventDefault();
    let updatedEvents;
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
    if (!isVisualEditing) setIsEditing(false);
    saveToBackend(updatedEvents);
  };

  const exportToCSV = () => {
    if (registrationsList.length === 0) return alert("No data to export");
    const dataToExport = filterEvent === 'all' 
        ? registrationsList 
        : registrationsList.filter(r => r.eventId?.toString() === filterEvent.toString());
    if (dataToExport.length === 0) return alert("No data found for this filter");
    const headers = ["Name", "Email", "Phone", "Source", "Event", "Date", "Status"];
    const rows = dataToExport.map(r => [
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.source}"`,
        `"${r.eventName}"`,
        `"${new Date(r.date).toLocaleString()}"`,
        `"${r.status || 'confirmed'}"`
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `HBM_CRM_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    document.body.removeChild(link);
  };

  const saveToBackend = async (data) => {
    setSaveStatus('Saving...');
    try {
      const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
      const apiUrl = `${base}/api/save-events`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: data }),
      });
      const result = await response.json();
      if (result.success) {
        setSaveStatus('Saved successfully!');
        setGlobalEvents(data);
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving');
    }
  };

  const saveVideoEventToBackend = async () => {
    setSaveStatus('Saving Video Event...');
    try {
      const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
      const response = await fetch(`${base}/api/video-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoEventConfig),
      });
      const result = await response.json();
      if (result.success) {
        setSaveStatus('Saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error saving');
    }
  };

  const fetchGalleryImages = async (folderName) => {
      try {
          const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
          const res = await fetch(`${base}/api/images/${folderName}`);
          const data = await res.json();
          setGalleryImages(data.images || []);
      } catch (err) {
          console.error("Failed to fetch images", err);
      }
  };

  const handleGalleryUpload = async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      // Auto-generate folderName if missing
      let folderName = currentEvent.folderName;
      if (!folderName) {
          folderName = `event-${currentEvent.id || Date.now()}`;
          handleChange('folderName', folderName);
      }

      const formData = new FormData();
      formData.append('folderName', folderName);
      for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
      
      setUploading(true);
      try {
          const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
          const res = await fetch(`${base}/api/upload-image`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
              await fetchGalleryImages(folderName);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
          e.target.value = '';
      }
  };

  const handleDeleteImage = async (filename) => {
      if(!window.confirm(`Delete ${filename}?`)) return;
      try {
          const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
          const res = await fetch(`${base}/api/delete-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ folderName: currentEvent.folderName, filename })
          });
          const data = await res.json();
          if(data.success) await fetchGalleryImages(currentEvent.folderName);
      } catch (err) {
          console.error(err);
      }
  };

  const handleAssetUpload = async (e, type) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const folderName = currentEvent?.folderName || 'video-event';
      const formData = new FormData();
      formData.append('folderName', folderName);
      if (type === 'partners') formData.append('subfolder', 'partners');
      formData.append('asset', file);
      try {
          const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
      const res = await fetch(`${base}/api/upload-asset`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
              const fullPath = `/assets/events/${folderName}/${data.filename}`;
              
              // Handle general event uploads
              if (currentEvent && currentEvent.folderName) {
                  if (type === 'hero') handleChange('heroVideo', fullPath);
                  if (type === 'thumbnail') handleChange('thumbnail', fullPath);
                  if (type === 'image') handleChange('image', fullPath);
                  if (type === 'partners') {
                      const newPartner = { name: 'New Partner', logo: `/assets/events/${folderName}/${data.path}`, website: '' };
                      handleChange('partners', [...(currentEvent.partners || []), newPartner]);
                  }
              }
              // Handle video event specific uploads
              else if (type === 'videoEventImage') {
                  setVideoEventConfig(prev => ({ ...prev, image: fullPath }));
              }
          }
      } catch (err) {
          console.error("Asset upload failed", err);
      }
  };

  const handleChange = (field, value, lang = null) => {
    if (lang) {
      setCurrentEvent(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    } else {
      setCurrentEvent(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleNestedChange = (parent, field, value) => {
      setCurrentEvent(prev => ({ ...prev, [parent]: { ...(prev[parent] || {}), [field]: value } }));
  };

  const handleVisualUpdate = (field, value) => {
      setCurrentEvent(prev => {
        if (field.includes('.')) {
            const parts = field.split('.');
            if (parts.length === 2) {
                const [parent, child] = parts;
                return { ...prev, [parent]: { ...prev[parent], [child]: value } };
            } else if (parts.length === 3) {
                const [parent, index, child] = parts;
                if (Array.isArray(prev[parent])) {
                    const newArray = [...prev[parent]];
                    newArray[parseInt(index)] = { ...newArray[parseInt(index)], [child]: value };
                    return { ...prev, [parent]: newArray };
                }
            }
        }
        return { ...prev, [field]: value };
      });
  };

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
          <h2 className="text-2xl font-bold mb-6 text-center tracking-tighter uppercase font-black">Admin Protocol</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full p-4 bg-gray-50 border rounded-xl font-bold text-center" />
            {error && <p className="text-red-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
               <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                  <Heart className="w-8 h-8 text-purple-600 fill-purple-600/20" /> Event Architect
               </h1>
               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 ml-11">Command Center v4.2.0</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
             <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-purple-600 font-bold transition-colors text-xs uppercase tracking-widest">
                <ExternalLink className="w-4 h-4" /> Live Site
             </a>
             <div className="w-px h-6 bg-gray-100"></div>
             {saveStatus && <span className="font-bold text-[10px] text-green-600 uppercase tracking-widest px-3">{saveStatus}</span>}
             <button onClick={handleAddNew} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Experience
             </button>
          </div>
        </div>

        {!isEditing && (
            <div className="flex bg-gray-100/50 backdrop-blur-sm self-start p-1.5 rounded-2xl border border-white/40 shadow-inner mb-8 w-fit">
                <button 
                    onClick={() => setTopView('events')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === 'events' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Calendar className="w-4 h-4" /> Experiences
                </button>
                <button 
                    onClick={() => setTopView('registrations')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === 'registrations' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Database className="w-4 h-4" /> CRM Database
                </button>
                <button 
                    onClick={() => setTopView('emails')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${topView === 'emails' ? 'bg-white text-purple-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Zap className="w-4 h-4" /> Email Architect
                    {/* Status Indicator */}
                    <span 
                        className={`absolute right-2 top-2 w-2 h-2 rounded-full ${emailEngineStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : emailEngineStatus === 'error' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} 
                        title={`Engine Status: ${emailEngineStatus}`}
                    />
                </button>
                <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
                <button 
                    onClick={() => setTopView('videoevent')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${topView === 'videoevent' ? 'bg-white text-red-500 shadow-xl' : 'text-gray-400 hover:text-red-400'}`}
                >
                    <MonitorPlay className="w-4 h-4" /> Video Event
                </button>
            </div>
        )}

        <div className="main-viewport">
            {topView === 'emails' && !isEditing && (
                <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EmailEngine />
                </div>
            )}

            {!isEditing && topView === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {events.map((event, idx) => (
                        <div key={event.id} className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border group ${idx === 0 ? 'border-amber-400 ring-4 ring-amber-400/20 scale-[1.02]' : 'border-gray-100'}`}>
                            {idx === 0 && (
                                <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center text-[10px] font-black uppercase tracking-widest py-1">✨ Next Experience</div>
                            )}
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img src={event.image || event.thumbnail || '/assets/default-event.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleEdit(event, 'visual')} className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm hover:bg-white transition-all"><Palette className="w-4 h-4 text-purple-600" /></button>
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{event.status}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title.en || event.title}</h3>
                                <p className="text-xs text-gray-400 font-bold mb-4 flex items-center gap-1 uppercase tracking-widest"><Calendar className="w-3 h-3 text-purple-400" /> {new Date(event.date).toLocaleDateString('he-IL')}</p>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-blue-50/50 p-3 rounded-xl text-center"><span className="block text-2xl font-black text-blue-600">{stats[event.id] || 0}</span><span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Regs</span></div>
                                    <div className="bg-purple-50/50 p-3 rounded-xl text-center"><span className="block text-2xl font-black text-purple-600">{event.imageCount || 0}</span><span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Photos</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(event)} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:bg-black transition-all font-bold tracking-widest"><Settings className="w-4 h-4" /> Manage</button>
                                    <button onClick={() => handleDuplicate(event)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all font-bold tracking-widest"><Copy className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(event.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all font-bold tracking-widest"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isEditing && topView === 'registrations' && (
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in duration-500 border">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Community Intelligence</h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Cross-Event Registry</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border rounded-xl pl-9 pr-4 py-3 text-xs font-bold w-full md:w-64" />
                            </div>
                            <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)} className="bg-white border rounded-xl px-4 py-2 text-xs font-bold">
                                <option value="all">Global</option>
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title.en || ev.title}</option>)}
                            </select>
                            <button onClick={exportToCSV} className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100"><Download className="w-4 h-4" /> Export</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b">
                                <tr>
                                    <th className="px-8 py-4">Participant</th>
                                    <th className="px-8 py-4">Email / Info</th>
                                    <th className="px-8 py-4 text-center">Score</th>
                                    <th className="px-8 py-4">Source</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {registrationsList.filter(reg => {
                                    const match = (reg.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (reg.email || '').toLowerCase().includes(searchTerm.toLowerCase());
                                    const filter = filterEvent === 'all' || reg.eventId?.toString() === filterEvent.toString();
                                    return match && filter;
                                }).slice().reverse().map((reg, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center font-black text-purple-600 text-[10px]">{reg.name.split(' ').map(n=>n[0]).join('')}</div>
                                                <div>
                                                    <div className="font-black text-gray-900 text-xs">{reg.name}</div>
                                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">{reg.eventName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-gray-600 font-bold text-xs">{reg.email}</div>
                                            <div className="text-gray-400 text-[10px]">{reg.phone}</div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="bg-purple-500 h-full" style={{width: '65%'}}></div></div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[8px] font-black uppercase">{reg.source || 'Direct'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-gray-300 hover:text-purple-600 transition-colors"><History className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {registrationsList.length === 0 && (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs italic tracking-widest">No Intelligence Data Sync</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isEditing && topView === 'videoevent' && videoEventConfig && (
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in duration-500 border p-8">
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                                <MonitorPlay className="w-6 h-6 text-red-500" />
                                Video Event Configuration
                            </h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                                Controls the popup registration on the homepage
                            </p>
                        </div>
                        <button 
                            onClick={saveVideoEventToBackend}
                            className="bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Deploy Video Event
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Title (EN)</label>
                                <input type="text" value={videoEventConfig.title.en} onChange={e => setVideoEventConfig(p => ({...p, title: {...p.title, en: e.target.value}}))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Title (HE)</label>
                                <input type="text" value={videoEventConfig.title.he} onChange={e => setVideoEventConfig(p => ({...p, title: {...p.title, he: e.target.value}}))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-right" dir="rtl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Date</label>
                                    <input type="date" value={videoEventConfig.date ? videoEventConfig.date.split('T')[0] : ''} onChange={e => setVideoEventConfig(p => ({...p, date: new Date(e.target.value).toISOString()}))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Time</label>
                                    <input type="time" value={videoEventConfig.time} onChange={e => setVideoEventConfig(p => ({...p, time: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Location</label>
                                <input type="text" value={videoEventConfig.location} onChange={e => setVideoEventConfig(p => ({...p, location: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Hero Image (Cover)</label>
                                <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4 relative border border-gray-200">
                                    {videoEventConfig.image ? (
                                        <img src={videoEventConfig.image} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-gray-300">
                                            <ImageIcon className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <input type="text" value={videoEventConfig.image} onChange={e => setVideoEventConfig(p => ({...p, image: e.target.value}))} className="flex-1 p-4 bg-gray-50 rounded-xl border-none font-bold text-xs" placeholder="URL or relative path" />
                                    <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors flex items-center justify-center">
                                        <Upload className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'videoEventImage')} />
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Popup Registration Fields</label>
                                <div className="flex gap-6 bg-gray-50 p-4 rounded-xl">
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                                        <input type="checkbox" checked={videoEventConfig.registrationFields?.name} onChange={e => setVideoEventConfig(p => ({...p, registrationFields: {...p.registrationFields, name: e.target.checked}}))} className="w-4 h-4 text-purple-600 rounded" />
                                        Name
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                                        <input type="checkbox" checked={videoEventConfig.registrationFields?.email} onChange={e => setVideoEventConfig(p => ({...p, registrationFields: {...p.registrationFields, email: e.target.checked}}))} className="w-4 h-4 text-purple-600 rounded" />
                                        Email
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                                        <input type="checkbox" checked={videoEventConfig.registrationFields?.phone} onChange={e => setVideoEventConfig(p => ({...p, registrationFields: {...p.registrationFields, phone: e.target.checked}}))} className="w-4 h-4 text-purple-600 rounded" />
                                        Phone
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditing && currentEvent && (
                isVisualEditing ? (
                    <VisualEventEditor 
                        event={currentEvent} 
                        onUpdate={handleVisualUpdate} 
                        onSave={handleSaveEvent} 
                        onClose={() => setIsEditing(false)} 
                        onUpload={handleAssetUpload} 
                    />
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border">
                        <div className="p-8 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] bg-white border px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"><ArrowLeft className="w-4 h-4" /> Back</button>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Event Protocol</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Object ID: {currentEvent.id}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
                                {['essentials', 'media', 'content', 'settings', 'registrations'].map(tab => (
                                    <button 
                                        key={tab} 
                                        onClick={() => setActiveTab(tab)} 
                                        className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSaveEvent} className="p-10">
                            {activeTab === 'essentials' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="space-y-6">
                                        <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Experience Title (EN)</label><input type="text" value={currentEvent.title.en || currentEvent.title} onChange={e => handleChange('title', e.target.value, 'en')} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900" /></div>
                                        <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Experience Title (HE)</label><input type="text" value={currentEvent.title.he || ''} onChange={e => handleChange('title', e.target.value, 'he')} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900 text-right" /></div>
                                        <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Time & Date</label><input type="datetime-local" value={currentEvent.date} onChange={e => handleChange('date', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900" /></div>
                                    </div>
                                    <div className="space-y-6">
                                        <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Strategic Location</label><input type="text" value={currentEvent.location} onChange={e => handleChange('location', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-black text-gray-900" /></div>
                                        <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Brief Description (EN)</label><textarea rows="5" value={currentEvent.description.en || currentEvent.description} onChange={e => handleChange('description', e.target.value, 'en')} className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 leading-relaxed" /></div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                    {/* Highlights */}
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Experience Highlights</h3>
                                            <button type="button" onClick={() => addArrayItem('highlights', { title: '', description: '' })} className="text-xs font-black text-purple-600 uppercase">+ Add Highlight</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {(currentEvent.highlights || []).map((item, idx) => (
                                                <div key={idx} className="p-6 bg-gray-50 rounded-2xl relative">
                                                    <button type="button" onClick={() => removeArrayItem('highlights', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                    <input placeholder="Title" value={item.title} onChange={e => handleArrayChange('highlights', idx, 'title', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-sm" />
                                                    <textarea placeholder="Description" value={item.description} onChange={e => handleArrayChange('highlights', idx, 'description', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-xs" rows="3" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Host Note */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h3 className="text-xl font-black mb-6 flex items-center gap-2 font-black tracking-tight"><Users className="w-5 h-5 text-blue-500" /> Host Connection</h3>
                                            <div className="space-y-4">
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Host Message</label><textarea value={currentEvent.hostNote?.message} onChange={e => handleNestedChange('hostNote', 'message', e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none text-sm font-medium" rows="4" /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Author Name</label><input value={currentEvent.hostNote?.author} onChange={e => handleNestedChange('hostNote', 'author', e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold text-xs" /></div>
                                                    <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Avatar URL</label><input value={currentEvent.hostNote?.avatar} onChange={e => handleNestedChange('hostNote', 'avatar', e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none text-xs" /></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-black flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-500" /> Intelligence (FAQs)</h3>
                                                <button type="button" onClick={() => addArrayItem('faqs', { question: '', answer: '' })} className="text-xs font-black text-purple-600 uppercase">+ Add FAQ</button>
                                            </div>
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {(currentEvent.faqs || []).map((faq, idx) => (
                                                    <div key={idx} className="p-4 bg-gray-50 rounded-xl relative">
                                                        <button type="button" onClick={() => removeArrayItem('faqs', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                        <input placeholder="Question" value={faq.question} onChange={e => handleArrayChange('faqs', idx, 'question', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-xs" />
                                                        <textarea placeholder="Answer" value={faq.answer} onChange={e => handleArrayChange('faqs', idx, 'answer', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-[10px]" rows="2" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Map & Location */}
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /> Geo-Targeting</h3>
                                            <div className="space-y-4">
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Display Address</label><input value={currentEvent.locationParams?.addressText} onChange={e => handleNestedChange('locationParams', 'addressText', e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-bold" /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Google Maps Embed URL / Link</label><textarea value={currentEvent.locationParams?.googleMapsEmbedUrl} onChange={e => handleNestedChange('locationParams', 'googleMapsEmbedUrl', e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none font-mono text-[10px]" rows="4" placeholder="Paste <iframe> or direct Google Maps link" /><p className="text-[9px] text-gray-400 mt-2 font-medium">💡 For best results, go to Google Maps → Share → Embed a map and paste the iframe here.</p></div>
                                            </div>
                                        </div>

                                        {/* Status & Capacity */}
                                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" /> Engine Config</h3>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Protocol Status</label>
                                                    <select value={currentEvent.status} onChange={e => handleChange('status', e.target.value)} className="w-full p-4 bg-gray-900 text-white rounded-xl border-none font-black text-xs uppercase tracking-widest">
                                                        <option value="draft">Draft Protocol</option>
                                                        <option value="published">Global Deploy</option>
                                                        <option value="past">Archive Only</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Target Capacity</label>
                                                    <input type="number" value={currentEvent.socialProof?.capacity || 50} onChange={e => handleNestedChange('socialProof', 'capacity', parseInt(e.target.value))} className="w-full p-4 bg-gray-50 rounded-xl border-none font-black" />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8 pt-8 border-t grid grid-cols-1 gap-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visual Editor Access</span>
                                                    <button type="button" onClick={() => setIsVisualEditing(true)} className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100">Open Designer</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Partners */}
                                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Ecosystem Partners</h3>
                                            <button type="button" onClick={() => addArrayItem('partners', { name: '', logo: '', website: '' })} className="text-xs font-black text-purple-600 uppercase">+ Add Partner</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {(currentEvent.partners || []).map((partner, idx) => (
                                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl relative border border-gray-100 group/partner">
                                                    <button type="button" onClick={() => removeArrayItem('partners', idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/partner:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                                    <div className="w-full aspect-video bg-white rounded-lg mb-2 overflow-hidden border border-gray-100 flex items-center justify-center p-2 relative group-hover/partner:border-purple-200 transition-all">
                                                        {partner.logo ? <img src={partner.logo} className="h-full w-full object-contain" /> : <ImageIcon className="w-6 h-6 text-gray-200" />}
                                                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/partner:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                                            <Upload className="w-5 h-5 text-white" />
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;
                                                                const formData = new FormData();
                                                                formData.append('folderName', currentEvent.folderName);
                                                                formData.append('subfolder', 'partners');
                                                                formData.append('asset', file);
                                                                const base = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : '';
                                                                fetch(`${base}/api/upload-asset`, { method: 'POST', body: formData })
                                                                    .then(res => res.json())
                                                                    .then(data => {
                                                                        if (data.success) {
                                                                            const p = data.path || data.filename;
                                                                            handleArrayChange('partners', idx, 'logo', `/assets/events/${currentEvent.folderName}/${p}`);
                                                                        }
                                                                    });
                                                            }} />
                                                        </label>
                                                    </div>
                                                    <input placeholder="Name" value={partner.name} onChange={e => handleArrayChange('partners', idx, 'name', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 mb-2 font-bold text-[10px]" />
                                                    <input placeholder="Website" value={partner.website} onChange={e => handleArrayChange('partners', idx, 'website', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-[8px] font-mono" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'media' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl">
                                        <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Video className="w-6 h-6 text-purple-400" /> Hero Cinema</h3>
                                        <div className="flex gap-4 items-center">
                                            <input type="text" value={currentEvent.heroVideo || ''} onChange={e => handleChange('heroVideo', e.target.value)} className="flex-1 p-4 bg-white/10 rounded-2xl border-white/10 text-white font-mono text-xs" placeholder="/assets/events/.../hero.mp4" />
                                            <label className="cursor-pointer bg-white text-gray-900 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">Upload MP4<input type="file" className="hidden" accept="video/mp4" onChange={e => handleAssetUpload(e, 'hero')} /></label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Hero Image (Details)</label>
                                            <div className="flex gap-3">
                                                <input type="text" value={currentEvent.image} onChange={e => handleChange('image', e.target.value)} className="flex-1 p-4 bg-gray-50 rounded-2xl border-none font-bold" />
                                                <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest"><ImageIcon className="w-4 h-4" /><input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'image')} /></label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Card Thumbnail (List)</label>
                                            <div className="flex gap-3">
                                                <input type="text" value={currentEvent.thumbnail} onChange={e => handleChange('thumbnail', e.target.value)} className="flex-1 p-4 bg-gray-50 rounded-2xl border-none font-bold" />
                                                <label className="cursor-pointer bg-gray-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest"><ImageIcon className="w-4 h-4" /><input type="file" className="hidden" accept="image/*" onChange={e => handleAssetUpload(e, 'thumbnail')} /></label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black flex items-center gap-2"><ImageIcon className="w-5 h-5 text-gray-400" /> Media Gallery</h3>
                                            <label className="cursor-pointer bg-gray-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                                                {uploading ? 'Processing...' : <><Upload className="w-4 h-4" /> Bulk Upload</>}
                                                <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleGalleryUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                            {galleryImages.map((img, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm shadow-gray-200 bg-black flex items-center justify-center">
                                                    {/\.(mp4|mov|webm)$/i.test(img) ? (
                                                        <Video className="w-8 h-8 text-white opacity-20" />
                                                    ) : (
                                                        <img src={`/assets/events/${currentEvent.folderName}/${img}`} className="w-full h-full object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button type="button" onClick={() => handleDeleteImage(img)} className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-all"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {galleryImages.length === 0 && <div className="col-span-full py-12 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest border border-dashed rounded-2xl">Empty Gallery</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'registrations' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 text-center"><h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-2">Cohort Success</h3><p className="text-5xl font-black text-blue-600">{stats[currentEvent.id] || 0}</p></div>
                                        <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100 text-center"><h3 className="text-purple-400 font-black uppercase text-[10px] tracking-widest mb-2">Global Impact</h3><p className="text-5xl font-black text-purple-600">{Object.values(stats).reduce((a,b)=>a+b,0)}</p></div>
                                        <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 text-center"><h3 className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">Waitlist</h3><p className="text-5xl font-black text-gray-300">0</p></div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 flex gap-4 pt-8 border-t">
                                <button type="submit" className="bg-purple-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-100 hover:bg-purple-700 hover:-translate-y-1 transition-all flex items-center gap-2"><Save className="w-5 h-5" /> Deploy Update</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-400 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Abort Changes</button>
                            </div>
                        </form>
                    </div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
