import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Video,
  MapPin,
  Star,
  Sparkles,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import api from '../api/axiosInstance';
import UserCard from '../components/cards/UserCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingModal from '../components/session/BookingModal';

const CATEGORIES = [
  'All',
  'Programming',
  'Creative',
  'Music',
  'Professional',
  'Languages',
  'Academic',
  'Fitness',
  'Lifestyle'
];

export default function DiscoverPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('ALL');
  const [level, setLevel] = useState('ALL');
  const [minRating, setMinRating] = useState('');

  const [bookingTeacher, setBookingTeacher] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [category, mode, level, minRating]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (mode !== 'ALL') params.append('mode', mode);
      if (level !== 'ALL') params.append('level', level);
      if (minRating) params.append('minRating', minRating);

      const res = await api.get(`/users/discover?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-800">
          <Compass className="w-3.5 h-3.5 text-brand-600" />
          <span>Explore Knowledge Exchangers in India</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          What do you want to learn today?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Find peers who teach guitar, data structures, conversational Spanish, public speaking, or cooking. Every session costs 1 knowledge credit per hour.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by skill (e.g. Guitar, Python, Excel, Spanish) or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-2xl shadow-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Filters:
          </span>

          {/* Mode */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Modes</option>
            <option value="ONLINE">Online Video</option>
            <option value="IN_PERSON">In-Person</option>
          </select>

          {/* Level */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Minimum Rating */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
          </select>
        </div>

        <span className="text-slate-400 font-semibold">
          Showing {users.length} peer teacher{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingSpinner text="Finding available community teachers..." />
      ) : users.length === 0 ? (
        <EmptyState
          type="no_matches"
          title="No skill teachers found matching these filters."
          description="Try broadening your search or resetting category filters."
          actionText="Reset All Filters"
          onActionClick={() => {
            setSearch('');
            setCategory('All');
            setMode('ALL');
            setLevel('ALL');
            setMinRating('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((peer) => (
            <UserCard
              key={peer._id}
              user={peer}
              onRequestSession={(teacher) => setBookingTeacher(teacher)}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingTeacher && (
        <BookingModal
          isOpen={!!bookingTeacher}
          onClose={() => setBookingTeacher(null)}
          teacher={bookingTeacher}
          onBookingSuccess={() => {
            alert('Session requested! Your credit has been held in escrow.');
          }}
        />
      )}
    </div>
  );
}
