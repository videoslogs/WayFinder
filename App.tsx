
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Coffee, 
  ArrowLeft, 
  Sun, 
  Wind, 
  Cloud, 
  CloudRain,
  MapPin, 
  Share, 
  Navigation,
  Clock,
  MoreVertical,
  Car,
  Palette,
  Trash2,
  ShieldAlert,
  Moon,
  RefreshCw,
  MessageCircle,
  Share2,
  Bus,
  Train,
  ExternalLink,
  Heart,
  Filter,
  Utensils,
  ShoppingBag,
  Landmark,
  CircleAlert,
  Map as MapIcon,
  ArrowRight,
  Footprints,
  Search,
  X,
  Maximize2,
  Sparkles,
  Crosshair,
  Leaf,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  Calendar,
  TrafficCone,
  Ticket,
  BarChart3,
  Timer,
  Zap,
  Banknote,
  Home,
  AlertTriangle,
  Wheelchair,
  ChevronDown,
  ChevronUp,
  Trees,
  Beer,
  BedDouble,
  ArrowRightLeft,
  ChevronRight
} from './components/Icons';
import { fetchRouteSuggestions } from './services/geminiService';
import { RouteData, TravelMode, RouteOption, PointOfInterest } from './types';
import { ModeIcon } from './components/Icons';
import { AdPlaceholder } from './components/AdPlaceholder';

// --- Constants ---
const LOCATION_SUGGESTIONS = [
  "Heathrow Airport (LHR)", "Gatwick Airport (LGW)", "Stansted Airport (STN)", "Luton Airport (LTN)", "City Airport (LCY)",
  "Paddington Station, W2", "King's Cross St. Pancras, N1", "Victoria Station, SW1", "Waterloo Station, SE1",
  "Liverpool Street Station, EC2", "Euston Station, NW1", "London Bridge, SE1", "Oxford Circus, W1",
  "Piccadilly Circus, W1", "Leicester Square, WC2", "Covent Garden, WC2", "Tower Bridge, SE1", "The Shard, SE1",
  "Buckingham Palace, SW1A", "British Museum, WC1", "Natural History Museum, SW7", "Science Museum, SW7",
  "V&A Museum, SW7", "Hyde Park, W2", "Regent's Park, NW1", "Camden Town, NW1", "Shoreditch, E1",
  "Canary Wharf, E14", "Westminster Abbey, SW1", "Houses of Parliament, SW1", "Trafalgar Square, WC2",
  "Soho, W1", "Notting Hill, W11", "Greenwich, SE10", "Stratford, E20", "Wembley Stadium, HA9",
  "O2 Arena, SE10", "Wimbledon, SW19", "Chelsea, SW3", "Kensington, W8", "Islington, N1",
  "Brixton, SW2", "Hampstead, NW3", "Clapham, SW4", "Ealing, W5", "Hammersmith, W6",
  "Fulham, SW6", "Battersea Power Station, SW8", "Richmond, TW9", "Kingston, KT1",
  "Croydon, CR0", "Harrow, HA1", "Harrow on the Hill, HA1", "Hackney, E8", "Haringey, N15",
  "Harrods, SW1", "Harley Street, W1", "Holborn, WC1", "Holloway, N7", "Hounslow, TW3",
  "Uxbridge, UB8", "Barking, IG11", "Dagenham, RM9", "Edgware, HA8", "Enfield, EN1",
  "Feltham, TW13", "Barnet, EN5", "Bexley, DA5", "Brent Cross, NW4", "Bromley, BR1",
  "Chiswick, W4", "Dalston, E8", "Elephant & Castle, SE1", "Finchley, N3", "Golders Green, NW11",
  "Highbury, N5", "Lewisham, SE13", "Peckham, SE15", "Putney, SW15", "Shepherd's Bush, W12",
  "South Kensington, SW7", "Tottenham, N17", "Walthamstow, E17", "Whitechapel, E1", "Woolwich, SE18"
];

// --- Context for Theme & App State ---
const AppContext = React.createContext<{
  isDarkMode: boolean;
  toggleTheme: () => void;
  favorites: { from: string, to: string }[];
  addFavorite: (from: string, to: string) => void;
  removeFavorite: (from: string, to: string) => void;
  clearFavorites: () => void;
  history: { from: string, to: string, date: string }[];
  addToHistory: (from: string, to: string) => void;
  clearHistory: () => void;
  resetApp: () => void;
}>({
  isDarkMode: true,
  toggleTheme: () => {},
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  clearFavorites: () => {},
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  resetApp: () => {}
});

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-black text-black dark:text-white">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mb-4"></div>
      <div className="absolute top-0 left-0 h-16 w-16 flex items-center justify-center animate-pulse">
        <Navigation className="w-6 h-6 text-accent" />
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 animate-pulse font-medium">Finding best routes...</p>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const baseStyle = "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  const variants = {
    primary: "bg-accent text-black hover:bg-yellow-300 shadow-md",
    secondary: "bg-gray-100 dark:bg-card text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

// --- Helper Functions ---

const calculateETA = (durationStr: string): string => {
  const now = new Date();
  let minutes = 0;
  
  const hrMatch = durationStr.match(/(\d+)\s*hr/);
  const minMatch = durationStr.match(/(\d+)\s*min/);
  
  if (hrMatch) minutes += parseInt(hrMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  
  now.setMinutes(now.getMinutes() + minutes);
  
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to get future time for Mock Data
const getFutureTime = (minutesToAdd: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesToAdd);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getLineColor = (text: string) => {
  if (!text) return '#6b7280'; // gray-500
  const t = text.toLowerCase();
  if (t.includes('bakerloo')) return '#B36305';
  if (t.includes('central')) return '#E32017';
  if (t.includes('circle')) return '#FFD300';
  if (t.includes('district')) return '#00782A';
  if (t.includes('hammersmith')) return '#F3A9BB';
  if (t.includes('jubilee')) return '#A0A5A9';
  if (t.includes('metropolitan')) return '#9B0056';
  if (t.includes('northern')) return '#000000';
  if (t.includes('piccadilly')) return '#003688';
  if (t.includes('victoria')) return '#0098D4';
  if (t.includes('waterloo')) return '#95CDBA';
  if (t.includes('elizabeth')) return '#6950a1';
  if (t.includes('dlr')) return '#00AFAD';
  if (t.includes('overground')) return '#EF7B10';
  return '#3b82f6'; // default blue
};

// --- Pages ---

const SearchPage = ({ onSearch }: { onSearch: (from: string, to: string) => void }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme, favorites, clearFavorites, history, addToHistory, clearHistory } = React.useContext(AppContext);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];
  // Get current time in HH:MM format
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromParam = params.get('from');
    const toParam = params.get('to');
    if (fromParam) setFrom(decodeURIComponent(fromParam));
    if (toParam) setTo(decodeURIComponent(toParam));
  }, [location]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
       setFrom("Finding location...");
       setTimeout(() => {
         setFrom("Current Location");
         setShowFromSuggestions(false);
       }, 800);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearch = () => {
    if (from && to) {
      addToHistory(from, to);
      onSearch(from, to);
    }
  };

  const handleReset = () => {
    setFrom('');
    setTo('');
    setScheduledTime('');
    setScheduledDate('');
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
  };

  const shareLocation = () => {
    const text = `I'm currently at ${from || "my location"}. Starting my journey with Wayfinder!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const formatScheduledTime = () => {
    if (!scheduledDate || !scheduledTime) return "Leave Now";
    const date = new Date(`${scheduledDate}T${scheduledTime}`);
    return `Depart: ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Improved Filtering Logic - Includes History & Strict StartsWith
  const filterSuggestions = (query: string) => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    
    // 1. History matches (Unique locations from history)
    const historyMatches = Array.from(new Set(
      history
        .flatMap(h => [h.from, h.to])
        .filter(loc => loc && loc.toLowerCase().includes(q))
    ));

    // 2. Predefined Location matches
    // Strict StartsWith matches
    const startsWith = LOCATION_SUGGESTIONS.filter(s => s.toLowerCase().startsWith(q));
    // Contains matches that do NOT start with (to avoid duplicates)
    const contains = LOCATION_SUGGESTIONS.filter(s => s.toLowerCase().includes(q) && !s.toLowerCase().startsWith(q));
    
    // Combine: History -> StartsWith -> Contains
    // Use Set to remove duplicates across categories
    const combined = Array.from(new Set([...historyMatches, ...startsWith, ...contains])).slice(0, 10);
    
    return combined;
  };

  const fromSuggestions = filterSuggestions(from);
  const toSuggestions = filterSuggestions(to);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 flex flex-col max-w-md mx-auto relative transition-colors duration-300">
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: 0.1s;
          opacity: 0; /* Start hidden */
          animation-fill-mode: forwards;
        }
      `}</style>
      <header className="flex justify-between items-center mb-6 py-2 animate-slide-down">
        <div className="text-gray-900 dark:text-accent text-2xl font-bold flex items-center gap-2">
          <Navigation className="w-7 h-7 animate-pulse" />
          Wayfinder
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleReset}
             className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
             title="Reset Search"
           >
             <RefreshCw className="w-5 h-5" />
           </button>
           <button 
             onClick={toggleTheme} 
             className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 transition-colors"
           >
             {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
           </button>
           <SettingsIcon className="text-gray-600 dark:text-white cursor-pointer hover:text-accent transition-colors w-6 h-6" onClick={() => navigate('/settings')} />
        </div>
      </header>

      {/* TIDY UNIFIED SEARCH BOX CONTAINER */}
      <div className="mb-6 relative z-30">
        {/* We remove overflow-hidden from the main wrapper to allow dropdowns to show */}
        <div className="bg-transparent flex flex-col shadow-sm rounded-2xl">
          
          {/* FROM INPUT SECTION */}
          <div className="relative bg-white dark:bg-slate-900 border border-b-0 border-gray-200 dark:border-gray-800 rounded-t-2xl">
             <div className="flex items-center relative p-3">
                <div className="absolute left-4 flex flex-col items-center justify-center h-full gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10"></div>
                </div>
                <div className="flex-1 ml-8">
                  <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-0.5">FROM</label>
                  <input 
                     value={from}
                     onChange={(e) => { setFrom(e.target.value); setShowFromSuggestions(true); }}
                     onFocus={() => setShowFromSuggestions(true)}
                     onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                     className="w-full bg-transparent text-gray-900 dark:text-white text-sm font-semibold focus:outline-none placeholder-gray-400"
                     placeholder="Address, Postcode, or Place"
                  />
                </div>
                <div className="flex items-center gap-2">
                   {from && (
                     <button onClick={() => setFrom('')} className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-3 h-3" />
                     </button>
                   )}
                   <button 
                    onClick={handleCurrentLocation}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-600 p-1 group"
                    title="Use Current Location"
                   >
                    <Crosshair className="w-5 h-5 group-hover:animate-spin" />
                   </button>
                </div>
             </div>
             {/* Auto Suggestions for FROM */}
             {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-slate-800 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl shadow-xl max-h-56 overflow-y-auto mx-2">
                  {fromSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                      onMouseDown={() => { setFrom(suggestion); setShowFromSuggestions(false); }}
                    >
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{suggestion}</span>
                    </div>
                  ))}
                </div>
             )}
          </div>

          {/* SWAP BUTTON - POSITIONED OVER DIVIDER */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 z-20">
             <button 
               onClick={() => { const temp = from; setFrom(to); setTo(temp); }}
               className="bg-gray-50 dark:bg-slate-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-accent hover:border-accent transition-all shadow-sm active:scale-90"
             >
                <ArrowRightLeft className="w-4 h-4 rotate-90" />
             </button>
          </div>

          {/* TO INPUT SECTION */}
          <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-b-2xl">
             <div className="flex items-center relative p-3">
                <div className="absolute left-4 flex flex-col items-center justify-center h-full gap-1">
                   <div className="w-2.5 h-2.5 rounded-sm bg-gray-900 dark:bg-white"></div>
                </div>
                <div className="flex-1 ml-8">
                  <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-0.5">TO</label>
                  <input 
                     value={to}
                     onChange={(e) => { setTo(e.target.value); setShowToSuggestions(true); }}
                     onFocus={() => setShowToSuggestions(true)}
                     onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                     className="w-full bg-transparent text-gray-900 dark:text-white text-sm font-semibold focus:outline-none placeholder-gray-400"
                     placeholder="Address, Postcode, or Place"
                  />
                </div>
                {to && (
                   <button onClick={() => setTo('')} className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1">
                      <X className="w-3 h-3" />
                   </button>
                )}
             </div>
             {/* Auto Suggestions for TO */}
             {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-slate-800 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl shadow-xl max-h-56 overflow-y-auto mx-2">
                  {toSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                      onMouseDown={() => { setTo(suggestion); setShowToSuggestions(false); }}
                    >
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{suggestion}</span>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        <div className="flex justify-end mt-2">
           <button onClick={shareLocation} className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-900/50 transition font-medium">
              <MessageCircle className="w-3 h-3" /> Share Location
           </button>
        </div>
      </div>

      {/* Leave Now Scheduler */}
      <div 
        onClick={() => setShowDatePicker(!showDatePicker)}
        className={`bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition border mb-6 ${(scheduledTime || showDatePicker) ? 'border-accent ring-1 ring-accent' : 'border-gray-200 dark:border-gray-800'} shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${(scheduledTime || showDatePicker) ? 'bg-accent/20' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
            <Clock className={`w-5 h-5 ${(scheduledTime || showDatePicker) ? 'text-accent' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-white font-medium text-sm">
              {formatScheduledTime()}
            </span>
            <span className="text-xs text-gray-500">Tap to schedule trip</span>
          </div>
        </div>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>

      {/* Date Picker Modal/Expander */}
      {showDatePicker && (
        <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl space-y-3 animate-fade-in-up mb-6">
           <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input 
                  type="date" 
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 text-sm dark:text-white"
                />
             </div>
             <div>
                <label className="text-xs text-gray-500 mb-1 block">Time</label>
                <input 
                  type="time" 
                  min={scheduledDate === today ? nowTime : undefined}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 text-sm dark:text-white"
                />
             </div>
           </div>
           <div className="flex justify-end gap-2">
              <button onClick={() => { setScheduledDate(''); setScheduledTime(''); setShowDatePicker(false); }} className="text-xs text-red-500 font-medium px-2 py-1">Reset</button>
              <button onClick={() => setShowDatePicker(false)} className="text-xs bg-accent text-black px-3 py-1 rounded-lg font-bold">Done</button>
           </div>
        </div>
      )}

      <Button onClick={handleSearch} className="w-full text-lg shadow-lg shadow-yellow-500/20 dark:shadow-yellow-900/20 mb-6 py-4 animate-bounce-subtle">
        Get Routes <ArrowRight className="w-5 h-5 ml-1" />
      </Button>

      {/* Favorites & Recent */}
      <div className="mt-2">
         {favorites.length > 0 && (
           <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Favorites
                </h3>
                <button onClick={clearFavorites} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1">
                   <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {favorites.map((fav, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setFrom(fav.from); setTo(fav.to); }}
                    className="min-w-[140px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer hover:border-accent transition flex-shrink-0"
                  >
                    <div className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">{fav.to}</div>
                    <div className="text-xs text-gray-500 truncate">from {fav.from}</div>
                  </div>
                ))}
              </div>
           </div>
         )}

         {history.length > 0 ? (
           <div>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">Recent</h3>
                 <button onClick={clearHistory} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1">
                   <Trash2 className="w-3 h-3" /> Clear History
                 </button>
              </div>
              <div className="space-y-3">
                {history.slice(0, 5).map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setFrom(item.from); setTo(item.to); }}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 rounded-xl cursor-pointer transition border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                  >
                    <div className="bg-gray-200 dark:bg-slate-800 p-2 rounded-full text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-gray-800 dark:text-gray-200 font-medium truncate">{item.to}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-600 truncate">From {item.from}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                ))}
              </div>
           </div>
         ) : (
           <div className="mt-8 text-center text-gray-400 text-sm">
             Your recent searches will appear here.
           </div>
         )}
      </div>

      <div className="mt-auto pt-8 pb-4 flex justify-end">
         <a href="https://www.paypal.com/donate/?hosted_button_id=ADHNXJ3Y46RXY" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:scale-110 transition">
           <Coffee className="w-3 h-3" /> Buy me a coffee
         </a>
      </div>
    </div>
  );
};

const ResultsPage = ({ data, onSelect }: { data: RouteData | null, onSelect: (opt: RouteOption) => void }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TravelMode | 'ALL'>('ALL');
  const [showComparison, setShowComparison] = useState(false);
  const { addFavorite, favorites, resetApp } = React.useContext(AppContext);

  useEffect(() => {
    if (data) {
       // Update logic if needed
    }
  }, [data]);

  if (!data) {
     return (
       <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
         <Navigation className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
         <p className="text-gray-500 dark:text-gray-400 mb-6">No route data available. Please search again.</p>
         <Button onClick={() => { resetApp(); navigate('/'); }}>Back to Search</Button>
       </div>
     );
  }

  // Filter options
  const filteredOptions = filter === 'ALL' ? data.options : data.options.filter(o => o.mode === filter);
  
  // Separate Walking options for minimalist display if viewing ALL
  const mainOptions = filter === 'ALL' ? filteredOptions.filter(o => o.mode !== TravelMode.WALKING) : filteredOptions;
  const walkingOptions = filter === 'ALL' ? filteredOptions.filter(o => o.mode === TravelMode.WALKING) : [];

  const isFavorite = favorites.some(f => f.from === data.from && f.to === data.to);

  const handleShareRoute = () => {
    // Robust URL construction
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const url = `${baseUrl}#/?from=${encodeURIComponent(data.from)}&to=${encodeURIComponent(data.to)}`;
    
    if (navigator.share) {
       navigator.share({
         title: 'Wayfinder Route',
         text: `Check out this route from ${data.from} to ${data.to}`,
         url: url
       }).catch((err) => {
         console.error("Share failed:", err);
         alert("Could not share. URL might be invalid or unsupported.");
       });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert("Route link copied to clipboard!");
    } else {
      prompt("Copy this link to share:", url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 max-w-md mx-auto pb-20 transition-colors duration-300">
      <style>{`
        @keyframes glowBlue {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); border-color: rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); border-color: rgba(59, 130, 246, 1); }
        }
        @keyframes glowPurple {
          0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.3); border-color: rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.6); border-color: rgba(168, 85, 247, 1); }
        }
        .animate-glow-blue { animation: glowBlue 2s infinite ease-in-out; }
        .animate-glow-purple { animation: glowPurple 2s infinite ease-in-out; }
      `}</style>
      <header className="flex justify-between items-center mb-6 py-2 sticky top-0 bg-gray-50/80 dark:bg-black/80 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button onClick={() => { resetApp(); navigate('/'); }} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition" title="Home">
            <Home className="text-gray-900 dark:text-white w-6 h-6" />
          </button>
        </div>
        <div className="text-gray-900 dark:text-white font-semibold">Route Options</div>
        <div className="flex gap-2">
           <button onClick={() => setShowComparison(!showComparison)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition" title="Compare Routes">
            <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button onClick={handleShareRoute} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-900 transition">
            <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button 
            onClick={() => addFavorite(data.from, data.to)}
            className={`p-2 rounded-full transition ${isFavorite ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-gray-400'}`} />
          </button>
        </div>
      </header>

      {/* Comparison Widget - TIGHTER & NEATER */}
      {showComparison && (
        <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in-up">
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide">Comparison</h3>
            <button onClick={() => setShowComparison(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
               <tr>
                 <th className="px-3 py-2 text-left font-bold">Mode</th>
                 <th className="px-3 py-2 text-right font-bold">Cost</th>
                 <th className="px-3 py-2 text-right font-bold">Time</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
               {data.options.map((opt, i) => (
                 <tr key={opt.id} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-900/50'}>
                    <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{opt.mode}</td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300 font-mono">
                       {opt.cost.includes('£') ? opt.cost : `£${opt.cost}`}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300 font-mono">{opt.duration}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Locations */}
      <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
             <div className="w-3 h-3 rounded-full bg-accent"></div>
             <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 my-1"></div>
             <div className="w-3 h-3 rounded-full border-2 border-accent bg-transparent"></div>
          </div>
          <div className="flex-1 min-w-0">
             <div>
               <p className="text-gray-500 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wide">Start</p>
               <p className="text-gray-900 dark:text-white truncate font-medium text-sm">{data.from}</p>
             </div>
             <div className="mt-3">
               <p className="text-gray-500 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wide">Destination</p>
               <p className="text-gray-900 dark:text-white truncate font-medium text-sm">{data.to}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
         {[
           { label: 'All', value: 'ALL', icon: <Filter className="w-3 h-3" /> },
           { label: 'Bus', value: TravelMode.BUS, icon: <Bus className="w-3 h-3" /> },
           { label: 'Tube', value: TravelMode.TUBE, icon: <Train className="w-3 h-3" /> },
           { label: 'Car', value: TravelMode.CAR, icon: <Car className="w-3 h-3" /> },
           { label: 'Walk', value: TravelMode.WALKING, icon: <Footprints className="w-3 h-3" /> },
         ].map(f => (
           <button 
             key={f.label}
             onClick={() => setFilter(f.value as any)}
             className={`
               flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border
               ${filter === f.value 
                 ? 'bg-accent text-black border-accent' 
                 : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
             `}
           >
             {f.icon} {f.label}
           </button>
         ))}
      </div>

      <div className="space-y-4">
        {filteredOptions.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No routes found for this filter.
          </div>
        )}
        
        {/* Main Options Render */}
        {mainOptions.map((option, index) => {
          const isBest = option.tag === 'Best' || option.tag === 'Fastest';
          const isCheapest = option.tag === 'Cheapest' || option.tag === 'Free';
          
          return (
            <div 
              key={option.id}
              onClick={() => onSelect(option)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative group animate-fade-in-up
                bg-white dark:bg-slate-900 hover:border-accent shadow-sm dark:shadow-none
                ${isBest ? 'border-blue-400 dark:border-blue-800 animate-glow-blue' : isCheapest ? 'border-purple-400 dark:border-purple-800 animate-glow-purple' : 'border-transparent'}
              `}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-accent`}>
                    <ModeIcon mode={option.mode} className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-bold text-lg">{option.mode}</span>
                      {option.tag && (
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                          ${isBest ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 
                            isCheapest ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                            'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'}
                        `}>
                          {option.tag}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                      Est. {option.cost}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-gray-900 dark:text-white font-bold text-xl">{option.duration}</div>
                   <div className="text-gray-500 dark:text-gray-400 text-sm">{option.distance}</div>
                </div>
              </div>

              {/* Traffic or Transit Info Snippet */}
              {option.trafficCondition && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className={`w-3 h-3 ${option.trafficCondition === 'Heavy' ? 'text-red-500' : option.trafficCondition === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}`} />
                  <span className="text-gray-600 dark:text-gray-300">{option.trafficCondition} Traffic</span>
                </div>
              )}
              
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 flex justify-between items-center">
                 <span>Tap for details</span>
                 <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          );
        })}

        {/* Minimalist Walking Option (if present and filter is ALL) */}
        {walkingOptions.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Healthy Alternatives</h4>
             {walkingOptions.map((option) => (
               <div 
                 key={option.id}
                 onClick={() => onSelect(option)}
                 className="p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 cursor-pointer flex justify-between items-center transition"
               >
                 <div className="flex items-center gap-3">
                    <Footprints className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Walking Route</span>
                       <span className="text-xs text-green-600 dark:text-green-400 font-medium">Eco-friendly & Free</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">{option.duration}</span>
                    <span className="text-xs text-gray-500">{option.distance}</span>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="mt-8 px-4 text-center">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
          Disclaimer: This is an AI-powered app using Google Gemini. Routes, schedules, and prices are estimates and may be inaccurate. Please check official service providers for real-time information.
        </p>
      </div>

      <AdPlaceholder />
    </div>
  );
};

const DetailsPage = ({ routeData, selectedOption, setSelectedOption, onSelectOption }: { 
  routeData: RouteData | null, 
  selectedOption: RouteOption | null,
  setSelectedOption: any,
  onSelectOption: (opt: RouteOption) => void
}) => {
  const navigate = useNavigate();
  const [poiSearch, setPoiSearch] = useState('');
  const { favorites, isDarkMode, resetApp } = React.useContext(AppContext);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAlongRoute, setShowAlongRoute] = useState(false); // Collapsible Along Route
  const [showSmartTips, setShowSmartTips] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

  if (!routeData || !selectedOption) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm animate-pulse">
          <MapPin className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Go?</h2>
        <Button onClick={() => { resetApp(); navigate('/'); }} className="w-full max-w-xs shadow-xl shadow-yellow-500/20 mb-6">
          Start Journey
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    // Robust URL construction
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const url = `${baseUrl}#/?from=${encodeURIComponent(routeData.from)}&to=${encodeURIComponent(routeData.to)}`;
    
    const shareData = {
      title: `Wayfinder: Route to ${routeData.to}`,
      text: `Going to ${routeData.to} via ${selectedOption.mode}. ${url}`,
      url: url
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share API error:', err); }
    } else {
      if (navigator.clipboard) {
         navigator.clipboard.writeText(url);
         alert("Link copied to clipboard!");
      }
    }
  };

  const openExternalMap = (type: 'directions' | 'nav' | 'search') => {
    const origin = encodeURIComponent(routeData.from);
    const destination = encodeURIComponent(routeData.to);
    
    // Convert internal TravelMode to Google Maps parameter
    let mapMode = 'driving';
    const currentMode = selectedOption.mode;
    if (currentMode === TravelMode.WALKING) mapMode = 'walking';
    else if (currentMode === TravelMode.BICYCLE) mapMode = 'bicycling';
    else if (currentMode === TravelMode.BUS || currentMode === TravelMode.TUBE || currentMode === TravelMode.TRAIN) mapMode = 'transit';
    
    let url = '';
    if (type === 'nav') {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mapMode}`;
    } else if (type === 'directions') {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mapMode}`;
    }
    window.open(url, '_blank');
  };

  const handleBookTicket = () => {
    const query = `${selectedOption.mode} from ${routeData.from} to ${routeData.to} tickets`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const events = routeData.pointsOfInterest.filter(p => p.type === 'Event');
  const coffeeShops = routeData.pointsOfInterest.filter(p => p.type === 'Coffee');
  const accessibility = routeData.pointsOfInterest.filter(p => p.type === 'Accessibility');
  const parks = routeData.pointsOfInterest.filter(p => p.type === 'Park');
  const bars = routeData.pointsOfInterest.filter(p => p.type === 'Bar');
  const hotels = routeData.pointsOfInterest.filter(p => p.type === 'Hotel');
  const otherPois = routeData.pointsOfInterest.filter(p => !['Event', 'Coffee', 'Accessibility', 'Park', 'Bar', 'Hotel'].includes(p.type));
  
  const totalPOIs = coffeeShops.length + accessibility.length + parks.length + bars.length + hotels.length + otherPois.length + events.length;

  const eta = calculateETA(selectedOption.duration);

  // Map style filter
  const mapFilter = isDarkMode 
    ? 'invert(100%) hue-rotate(180deg) brightness(85%) contrast(85%)' 
    : 'grayscale(0%) contrast(100%)';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black max-w-md mx-auto flex flex-col transition-colors duration-300">
      <style>{`
        @keyframes borderPulse {
          0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); border-color: rgba(250, 204, 21, 1); }
          50% { box-shadow: 0 0 10px 4px rgba(250, 204, 21, 0.4); border-color: rgba(250, 204, 21, 0.5); }
          100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); border-color: rgba(250, 204, 21, 1); }
        }
        .animate-border-pulse {
          animation: borderPulse 2s infinite;
        }
        @keyframes rgbPulse {
          0% { border-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
          20% { border-color: #ffff00; box-shadow: 0 0 5px #ffff00; }
          40% { border-color: #00ff00; box-shadow: 0 0 5px #00ff00; }
          60% { border-color: #00ffff; box-shadow: 0 0 5px #00ffff; }
          80% { border-color: #0000ff; box-shadow: 0 0 5px #0000ff; }
          100% { border-color: #ff00ff; box-shadow: 0 0 5px #ff00ff; }
        }
        .animate-rgb-pulse {
          animation: rgbPulse 3s linear infinite;
        }
        @keyframes mapEnter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 0.9; transform: scale(1); }
        }
        .animate-map-enter {
          animation: mapEnter 0.6s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>

      {/* Expandable Real Embed Map Header - LARGER */}
      <div className={`relative transition-all duration-300 ease-in-out bg-slate-200 dark:bg-slate-800 overflow-hidden group ${isMapExpanded ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[45vh] w-full'}`}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, opacity: 0.9, filter: mapFilter, transition: 'filter 0.5s ease' }}
          className="animate-map-enter"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?saddr=${encodeURIComponent(routeData.from)}&daddr=${encodeURIComponent(routeData.to)}&output=embed&t=m&iwloc=near`}
        ></iframe>
        
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
           <div className="pointer-events-auto flex gap-2">
              {!isMapExpanded && (
                <>
                  <button onClick={() => navigate('/results')} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => { resetApp(); navigate('/'); }} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition">
                    <Home className="w-5 h-5" />
                  </button>
                </>
              )}
              {isMapExpanded && (
                <button onClick={() => setIsMapExpanded(false)} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition">
                   <X className="w-5 h-5" />
                </button>
              )}
           </div>

          <div className="flex gap-2 pointer-events-auto">
             <button onClick={() => setIsMapExpanded(!isMapExpanded)} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition">
                <Maximize2 className="w-5 h-5" />
             </button>
             {!isMapExpanded && (
              <button onClick={handleShare} className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition">
                <Share2 className="w-5 h-5" />
              </button>
             )}
          </div>
        </div>
      </div>

      <div className={`flex-1 bg-gray-50 dark:bg-black -mt-6 rounded-t-3xl relative z-10 p-5 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform ${isMapExpanded ? 'translate-y-full hidden' : 'translate-y-0'}`}>
        
        {/* Tiny Minimal Weather Widget - Moved to Top */}
        <div className="flex justify-center mb-4">
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-3 border border-gray-100 dark:border-slate-800 shadow-sm">
               <div className="flex items-center gap-1.5">
                 <Sun className="w-3.5 h-3.5 text-orange-500" />
                 <span className="text-xs font-bold text-gray-900 dark:text-white">{routeData.weather.destination.temp}</span>
               </div>
               <div className="w-px h-3 bg-gray-300 dark:bg-gray-700"></div>
               <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{routeData.weather.destination.condition}</span>
           </div>
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-accent flex items-center gap-2">
              <ModeIcon mode={selectedOption.mode} className="w-6 h-6" />
              {selectedOption.mode}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedOption.distance} • {selectedOption.duration}</p>
          </div>
          <div className="text-right">
             <div className="bg-gray-200 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
              Est. {selectedOption.cost}
             </div>
             <div className="text-xs text-gray-500 mt-1 font-mono">ETA: {eta}</div>
          </div>
        </div>
        
        {/* Start/Dest Details - Animated */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 p-2 rounded-lg border-2 border-transparent animate-border-pulse">
            <div className="flex-1 truncate">
               <span className="font-bold text-gray-700 dark:text-gray-300">From:</span> {routeData.from}
            </div>
            <ArrowRight className="w-3 h-3 text-gray-300" />
            <div className="flex-1 truncate text-right">
               <span className="font-bold text-gray-700 dark:text-gray-300">To:</span> {routeData.to}
            </div>
        </div>

        {/* Live Service / Next Departure / Updates */}
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border-2 border-transparent animate-rgb-pulse">
           <div className="flex items-center gap-4 mb-2">
             <div className="relative p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Live Status</span>
                   <span className="text-xs font-bold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 rounded animate-pulse">
                      Updating
                   </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                   {selectedOption.nextDeparture ? `${selectedOption.nextDeparture} • Arrive ~${selectedOption.arrivalEstimate}` : 'Check live boards'}
                </div>
             </div>
           </div>
           
           {/* Next 3 Departures List */}
           {selectedOption.nextDepartures && selectedOption.nextDepartures.length > 0 && (
             <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
               <span className="text-xs text-gray-500 dark:text-gray-400 self-center mr-1">Next:</span>
               {selectedOption.nextDepartures.map((time, idx) => (
                 <span key={idx} className="text-xs px-2 py-1 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-800 text-gray-600 dark:text-gray-300 font-mono">
                   {time}
                 </span>
               ))}
             </div>
           )}
        </div>

        {/* Ride-Hail Specific Options (Uber, Bolt, etc) */}
        {(selectedOption.mode === TravelMode.CAR || selectedOption.mode === TravelMode.RIDE_HAIL) && (
           <div className="mb-6 animate-fade-in-up">
              <h3 className="text-gray-900 dark:text-white font-semibold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                 Book a Ride
              </h3>
              <div className="grid grid-cols-2 gap-2">
                 <a href="https://m.uber.com/ul/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition">
                    <span className="font-bold">Uber</span>
                 </a>
                 <a href="https://bolt.eu/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition">
                    <span className="font-bold">Bolt</span>
                 </a>
                 <a href="https://gett.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-yellow-500 text-black p-3 rounded-xl hover:bg-yellow-400 transition">
                    <span className="font-bold">Black Cab</span>
                 </a>
                 <a href="https://www.addisonlee.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-600 transition">
                    <span className="font-bold">Minicab</span>
                 </a>
              </div>
           </div>
        )}

        {/* Travel Time Breakdown Timeline - Collapsible */}
        {selectedOption.segments && selectedOption.segments.length > 0 && (
           <div className="mb-6">
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 hover:text-accent transition"
              >
                 <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Journey Breakdown</span>
                 {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showBreakdown && (
                <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in-up">
                   {selectedOption.segments.map((seg, i) => {
                      // Apply line colors
                      const lineColor = getLineColor(seg.description);
                      return (
                        <div key={i} className="relative pl-4">
                           <div 
                              className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-gray-50 dark:ring-black`}
                              style={{ backgroundColor: seg.mode === 'Walking' ? '#9ca3af' : lineColor }}
                           ></div>
                           <div className="flex justify-between items-start group">
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {seg.mode === 'Walking' ? <Footprints className="w-3 h-3 text-gray-500" /> : seg.mode.includes('Bus') ? <Bus className="w-3 h-3" /> : seg.mode.includes('Train') || seg.mode.includes('Tube') ? <Train className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                                    {seg.mode}
                                 </p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{seg.description}</p>
                              </div>
                              <span className="text-xs font-mono font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded ml-2">
                                 {seg.duration}
                              </span>
                           </div>
                        </div>
                      );
                   })}
                </div>
              )}
           </div>
        )}

        {/* Route Instructions / Lines */}
        {(selectedOption.details || (selectedOption.transitLines && selectedOption.transitLines.length > 0)) && (
          <div className="mb-4">
             {selectedOption.transitLines && selectedOption.transitLines.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedOption.transitLines.map((line, idx) => {
                    const color = getLineColor(line);
                    // Basic contrast check for text color
                    const isLightColor = ['circle', 'hammersmith', 'waterloo'].some(l => line.toLowerCase().includes(l));
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                        style={{ 
                          backgroundColor: color,
                          color: isLightColor ? '#000000' : '#FFFFFF'
                        }}
                      >
                        {line}
                      </span>
                    );
                  })}
                </div>
             )}
             {selectedOption.details && !selectedOption.segments?.length && (
               <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg">
                 <span className="font-bold">Via: </span> {selectedOption.details}
               </p>
             )}
          </div>
        )}

        {/* AI Suggestion / Optimization Tips - Collapsible */}
        {routeData.aiSuggestion && (
           <div className="mb-4">
              <button 
                onClick={() => setShowSmartTips(!showSmartTips)}
                className="w-full flex justify-between items-center text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase mb-2 hover:text-accent transition"
              >
                 <span className="flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> Smart Tips</span>
                 {showSmartTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {showSmartTips && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800/30 animate-fade-in-up">
                   <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed italic">
                     "{routeData.aiSuggestion}"
                   </p>
                </div>
              )}
           </div>
        )}

        {/* Points of Interest: Coffee & Accessibility - COLLAPSIBLE DROP DOWN */}
        <div className="mb-6">
           <button 
             onClick={() => setShowAlongRoute(!showAlongRoute)}
             className="w-full flex justify-between items-center text-xs font-bold text-gray-900 dark:text-accent uppercase mb-3 hover:text-yellow-500 transition"
           >
              <span className="flex items-center gap-2">
                  Along Route 
                  <span className="text-[10px] text-black bg-accent px-1.5 py-0.5 rounded-full animate-pulse shadow-sm shadow-yellow-500/50">
                    {totalPOIs}
                  </span>
              </span>
              {showAlongRoute ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
           </button>
           
           {showAlongRoute && (
             <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm max-h-80 overflow-y-auto animate-fade-in-up">
               
                {/* Events Section (Moved inside Dropdown as requested) */}
                {events.length > 0 && (
                   <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800/30">
                      <h3 className="text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                         <Sparkles className="w-3 h-3" /> Happening Now
                      </h3>
                      <div className="space-y-2">
                        {events.map((evt, idx) => (
                          <div key={idx} className="flex flex-col text-gray-800 dark:text-gray-200">
                             <span className="font-semibold text-[11px] truncate">{evt.name}</span>
                             <div className="flex justify-between items-end">
                               <p className={`text-gray-500 dark:text-gray-400 text-[10px] mt-0.5 leading-tight ${expandedEventId === idx ? '' : 'line-clamp-2'}`}>
                                 {evt.description}
                               </p>
                               <button 
                                 onClick={() => setExpandedEventId(expandedEventId === idx ? null : idx)}
                                 className="text-[10px] text-purple-600 dark:text-purple-400 font-bold ml-2 whitespace-nowrap"
                               >
                                 {expandedEventId === idx ? 'Less' : 'More'}
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                )}

               {/* Coffee Shops */}
               {coffeeShops.map((poi, idx) => (
                 <div key={`coffee-${idx}`} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full text-orange-600 dark:text-orange-400">
                       <Coffee className="w-3 h-3" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                       <div className="text-[10px] text-gray-500">{poi.description}</div>
                   </div>
                 </div>
               ))}
               
               {/* Accessibility Info */}
               {accessibility.map((poi, idx) => (
                 <div key={`acc-${idx}`} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                       <Wheelchair className="w-3 h-3" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                       <div className="text-[10px] text-gray-500">{poi.description}</div>
                   </div>
                 </div>
               ))}

               {/* Parks */}
               {parks.map((poi, idx) => (
                 <div key={`park-${idx}`} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full text-green-600 dark:text-green-400">
                       <Trees className="w-3 h-3" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                   </div>
                 </div>
               ))}

               {/* Bars */}
               {bars.map((poi, idx) => (
                 <div key={`bar-${idx}`} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full text-amber-600 dark:text-amber-400">
                       <Beer className="w-3 h-3" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                   </div>
                 </div>
               ))}
               
                {/* Hotels */}
               {hotels.map((poi, idx) => (
                 <div key={`hotel-${idx}`} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-full text-indigo-600 dark:text-indigo-400">
                       <BedDouble className="w-3 h-3" />
                   </div>
                   <div className="flex-1 min-w-0">
                       <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                   </div>
                 </div>
               ))}

               {/* Other POIs */}
               {otherPois.map((poi, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-2 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                   <div className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-full text-gray-600 dark:text-gray-300">
                     {poi.type === 'Restaurant' ? <Utensils className="w-3 h-3" /> : 
                     poi.type === 'Shop' ? <ShoppingBag className="w-3 h-3" /> :
                     <Landmark className="w-3 h-3" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{poi.name}</div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Action Buttons: Book & Nav */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button onClick={handleBookTicket} variant="primary" className="text-sm font-bold shadow-lg shadow-yellow-500/20 col-span-2">
             <Ticket className="w-4 h-4" /> Book Ticket
          </Button>
          <Button onClick={() => openExternalMap('nav')} variant="secondary" className="text-sm border dark:border-gray-700">
            <Navigation className="w-4 h-4" /> Start
          </Button>
          <Button onClick={() => openExternalMap('directions')} variant="secondary" className="text-sm border dark:border-gray-700">
             Directions
          </Button>
        </div>

        <AdPlaceholder />
        
        <div className="fixed bottom-6 right-6 z-30">
            <a href="https://www.paypal.com/donate/?hosted_button_id=ADHNXJ3Y46RXY" target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 h-10 bg-yellow-400 text-black rounded-full shadow-lg hover:scale-110 transition tooltip" title="Buy me a coffee">
               <Coffee className="w-5 h-5" />
            </a>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { isDarkMode, toggleTheme, clearHistory, history } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const LegalSection = ({ title, content }: { title: string, content: string }) => (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button 
        onClick={() => toggleSection(title)}
        className="w-full py-3 flex justify-between items-center text-left text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-accent"
      >
        {title}
        {openSection === title ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {openSection === title && (
        <div className="pb-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 max-w-md mx-auto transition-colors duration-300">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </header>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wide">Data Management</h3>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Search History ({history.length} items)</span>
            <button onClick={clearHistory} className="text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition">Clear All</button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Your search history and favorites are stored locally on your device. Clearing data will remove them permanently from this browser.
          </p>
        </div>

        {/* Legal Information */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
           <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wide">Legal & Privacy</h3>
           <LegalSection 
             title="Privacy Policy" 
             content="Wayfinder is committed to protecting your privacy. We do not collect or store personal location data on our servers. All route calculations and location processing are handled via anonymous API requests. Your history and favorites are stored locally on your device." 
           />
           <LegalSection 
             title="GDPR Compliance" 
             content="In compliance with GDPR, Wayfinder ensures that no personally identifiable information (PII) is tracked without consent. We use local storage for app functionality (theme, history). You have the full right to clear your data at any time using the Data Management tools provided above." 
           />
           <LegalSection 
             title="Terms of Service" 
             content="By using Wayfinder, you agree that route information is provided for informational purposes only. We are not liable for any inaccuracies, delays, or damages resulting from the use of this application. Always verify travel details with official providers." 
           />
        </div>

        {/* About */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wide">About</h3>
          <p className="text-sm text-gray-500">Wayfinder v1.1.0</p>
          <p className="text-xs text-gray-400 mt-1">Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = ({ loading, routeData, setRouteData, selectedOption, setSelectedOption, setLoading }: any) => {
  const navigate = useNavigate();

  const onSearch = async (from: string, to: string) => {
    setLoading(true);
    try {
      const data = await fetchRouteSuggestions(from, to);
      setRouteData(data);
      // Persist to session storage
      sessionStorage.setItem('wayfinder_route_data', JSON.stringify(data));
      navigate('/results');
    } catch (error) {
      console.error(error);
      alert("Could not fetch routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSelectOption = (opt: RouteOption) => {
    setSelectedOption(opt);
    // Persist to session storage
    sessionStorage.setItem('wayfinder_selected_option', JSON.stringify(opt));
    navigate('/details');
  };

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<SearchPage onSearch={onSearch} />} />
      <Route path="/results" element={<ResultsPage data={routeData} onSelect={onSelectOption} />} />
      <Route path="/details" element={<DetailsPage routeData={routeData} selectedOption={selectedOption} setSelectedOption={setSelectedOption} onSelectOption={onSelectOption} />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Initialize state from Session Storage if available (Persistence)
  const [routeData, setRouteData] = useState<RouteData | null>(() => {
    try {
      const saved = sessionStorage.getItem('wayfinder_route_data');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  const [selectedOption, setSelectedOption] = useState<RouteOption | null>(() => {
    try {
      const saved = sessionStorage.getItem('wayfinder_selected_option');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [favorites, setFavorites] = useState<{ from: string, to: string }[]>(() => {
    try {
      const saved = localStorage.getItem('wayfinder_favs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [history, setHistory] = useState<{ from: string, to: string, date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('wayfinder_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('wayfinder_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('wayfinder_history', JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addFavorite = (from: string, to: string) => {
    if (!favorites.some(f => f.from === from && f.to === to)) {
      setFavorites([...favorites, { from, to }]);
    }
  };

  const removeFavorite = (from: string, to: string) => {
    setFavorites(favorites.filter(f => f.from !== from || f.to !== to));
  };
  
  const clearFavorites = () => setFavorites([]);

  const addToHistory = (from: string, to: string) => {
    const newEntry = { from, to, date: new Date().toISOString() };
    setHistory(prev => {
      const filtered = prev.filter(h => h.from !== from || h.to !== to);
      return [newEntry, ...filtered].slice(0, 10);
    });
  };

  const clearHistory = () => setHistory([]);

  const resetApp = () => {
    setRouteData(null);
    setSelectedOption(null);
    sessionStorage.removeItem('wayfinder_route_data');
    sessionStorage.removeItem('wayfinder_selected_option');
  };

  return (
    <AppContext.Provider value={{
      isDarkMode, toggleTheme,
      favorites, addFavorite, removeFavorite, clearFavorites,
      history, addToHistory, clearHistory,
      resetApp
    }}>
      <div className={isDarkMode ? 'dark' : ''}>
        <HashRouter>
          <AppRoutes
            loading={loading}
            routeData={routeData}
            setRouteData={setRouteData}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            setLoading={setLoading}
          />
        </HashRouter>
      </div>
    </AppContext.Provider>
  );
};

export default App;