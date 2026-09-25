import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Video,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import api from '../api/axiosInstance';
import SkillBadge from '../components/common/SkillBadge';
import ReviewCard from '../components/cards/ReviewCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingModal from '../components/session/BookingModal';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingTeacher, setBookingTeacher] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/profile/${id}`);
      if (res.data.success) {
        setUser(res.data.user);
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading skill exchange profile..." />;
  }

  if (!user) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">User Profile Not Found</h2>
        <Link to="/discover" className="text-sm font-semibold text-brand-600 hover:underline">
          Return to Discover
        </Link>
      </div>
    );
  }

  const isSelf = currentUser?._id?.toString() === user._id?.toString();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={user.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-brand-500/10 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified Peer
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.location || 'India'}</span>
                <span>•</span>
                <span className="capitalize">{user.preferredMode?.toLowerCase().replace('_', ' ')} Sessions</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {user.rating?.toFixed(1) || '5.0'} ({user.reviewCount || 0} reviews)
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{user.completedSessions || 0} completed exchanges</span>
              </div>
            </div>
          </div>

          <div>
            {isSelf ? (
              <Link
                to="/profile/edit"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Edit My Skills
              </Link>
            ) : (
              <button
                onClick={() => setBookingTeacher(user)}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Request Skill Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">About</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">{user.bio}</p>
          </div>
        )}

        {/* Teaching Hours vs Learning Hours Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-800">Teaching Hours</p>
            <p className="text-xl font-black text-emerald-950 mt-0.5">{user.completedTeachingHours || 0}h</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <p className="text-[11px] font-bold text-indigo-800">Learning Hours</p>
            <p className="text-xl font-black text-indigo-950 mt-0.5">{user.completedLearningHours || 0}h</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-700">Credits Earned</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">+{user.earnedCredits || 0}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-700">Days Available</p>
            <p className="text-xs font-bold text-slate-900 mt-2">
              {user.availability?.weekends && user.availability?.weekdays
                ? 'All Week'
                : user.availability?.weekends
                ? 'Weekends'
                : 'Weekdays'}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Offered & Skills Wanted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* I Can Teach */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>I Can Teach (Earns 1 Cr / hr)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {user.skillsOffered?.length || 0} skills
            </span>
          </div>

          <div className="space-y-3">
            {user.skillsOffered?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            ) : (
              user.skillsOffered?.map((so, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{so.skill?.name}</span>
                    <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {so.level} • {so.experienceYears}y exp
                    </span>
                  </div>
                  {so.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{so.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* I Want to Learn */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>I Want to Learn (Costs 1 Cr / hr)</span>
            </h3>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {user.skillsWanted?.length || 0} wishlist
            </span>
          </div>

          <div className="space-y-3">
            {user.skillsWanted?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No wishlist skills listed yet.</p>
            ) : (
              user.skillsWanted?.map((sw, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{sw.skill?.name}</span>
                    <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      Target: {sw.desiredLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Category: {sw.skill?.category || 'General'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Verified Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Verified Exchange Reviews ({reviews.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Only verified completed sessions can leave reviews</span>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-400 italic">
            No completed session reviews yet. Be the first to exchange knowledge with {user.name}!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingTeacher && (
        <BookingModal
          isOpen={!!bookingTeacher}
          onClose={() => setBookingTeacher(null)}
          teacher={bookingTeacher}
          onBookingSuccess={() => {
            alert('Session requested! Your credit has been reserved in escrow.');
          }}
        />
      )}
    </div>
  );
}
