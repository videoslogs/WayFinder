
import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Footprints, 
  Bus, 
  Car, 
  Train, 
  Bike, 
  ArrowRightLeft, 
  Settings, 
  ChevronLeft, 
  MoreVertical, 
  Share, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind,
  Coffee,
  ShieldAlert,
  Palette,
  Database,
  Trash2,
  ExternalLink,
  Moon,
  RefreshCw,
  MessageCircle,
  Share2,
  Heart,
  Filter,
  Utensils,
  ShoppingBag,
  Landmark,
  CircleAlert,
  Map,
  ArrowRight,
  Maximize2,
  Sparkles,
  Crosshair,
  Leaf,
  Link,
  Search,
  X,
  ArrowLeft,
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
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trees,
  Beer,
  BedDouble
} from 'lucide-react';
import { TravelMode } from '../types';

// Manual definition for Wheelchair to avoid import errors
export const Wheelchair = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="m4.9 4.9 14.2 14.2"/>
  </svg>
);

export const ModeIcon = ({ mode, className }: { mode: TravelMode; className?: string }) => {
  switch (mode) {
    case TravelMode.WALKING: return <Footprints className={className} />;
    case TravelMode.BUS: return <Bus className={className} />;
    case TravelMode.CAR:
    case TravelMode.RIDE_HAIL: return <Car className={className} />;
    case TravelMode.TUBE:
    case TravelMode.TRAIN: return <Train className={className} />;
    case TravelMode.BICYCLE: return <Bike className={className} />;
    default: return <Navigation className={className} />;
  }
};

export { 
  MapPin, Navigation, Clock, ArrowRightLeft, Settings, ChevronLeft, MoreVertical, 
  Share, Sun, Cloud, CloudRain, Wind, Coffee, ShieldAlert, Palette, Database, Trash2, ExternalLink,
  Moon, RefreshCw, MessageCircle, Share2, Heart, Filter, Utensils, ShoppingBag, Landmark, CircleAlert,
  Map, ArrowRight, Maximize2, Sparkles, Crosshair, Leaf, Link, Search, X, ArrowLeft,
  Footprints, Bus, Car, Train, Bike, ZoomIn, ZoomOut, Calendar, TrafficCone, Ticket,
  BarChart3, Timer, Zap, Banknote, Home, TriangleAlert, ChevronDown, ChevronUp, ChevronRight,
  Trees, Beer, BedDouble
};
