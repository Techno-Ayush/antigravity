import React, { useState, useEffect } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PersonCard } from '../components/People';
import api from '../api/axiosInstance';
import RequestSessionModal from '../components/modals/RequestSessionModal';
import { useAuth } from '../context/AuthContext';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const queryFromUrl = searchParams.get('q') || '';
  const [search, setSearch] = useState(queryFromUrl);
  const [category, setCategory] = useState('All categories');
  const [modeOnline, setModeOnline] = useState(true);
  const [modeInPerson, setModeInPerson] = useState(true);
  const [minRating, setMinRating] = useState('0');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    setSearch(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const fetchDiscoverUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (category !== 'All categories') params.append('category', category);
        if (modeOnline && !modeInPerson) params.append('mode', 'online');
        if (modeInPerson && !modeOnline) params.append('mode', 'in_person');
        if (Number(minRating) > 0) params.append('minRating', minRating);

        const res = await api.get(`/users/discover?${params.toString()}`);
        if (res.data.success) {
          setPeople(res.data.users || []);
        }
      } catch (err) {
        console.error('Failed to discover users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoverUsers();
  }, [search, category, modeOnline, modeInPerson, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All categories');
    setModeOnline(true);
    setModeInPerson(true);
    setMinRating('0');
    setSearchParams({});
  };

  return (
    <section className="page">
      <div className="discover-hero">
        <p className="eyebrow">SMART RULE-BASED MATCHING</p>
        <h1>Find a skill. Meet your teacher.</h1>
        <p>Matches are based on skills, availability, session mode, and community reputation.</p>
        <form className="discover-search" onSubmit={handleSearchSubmit}>
          <Search size={21} />
          <input
            placeholder="What do you want to learn? (e.g. React, Spanish, Guitar)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="dark-btn">
            Search
          </button>
        </form>
      </div>

      <div className="discover-layout">
        <aside className="filter-panel">
          <div>
            <h3>Filters</h3>
            <button type="button" className="text-button" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All categories">All categories</option>
              <option value="Programming">Programming</option>
              <option value="Language">Language</option>
              <option value="Creative">Creative / Design</option>
              <option value="Music">Music</option>
              <option value="Academics">Academics</option>
              <option value="Fitness">Fitness</option>
            </select>
          </label>

          <label>
            Session mode
            <div className="check">
              <input
                type="checkbox"
                checked={modeOnline}
                onChange={(e) => setModeOnline(e.target.checked)}
              />{' '}
              Online
            </div>
            <div className="check">
              <input
                type="checkbox"
                checked={modeInPerson}
                onChange={(e) => setModeInPerson(e.target.checked)}
              />{' '}
              In person
            </div>
          </label>

          <label>
            Minimum rating
            <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="0">Any rating</option>
              <option value="4.0">4.0 and above</option>
              <option value="4.5">4.5 and above</option>
              <option value="4.8">4.8 and above</option>
            </select>
          </label>
        </aside>

        <div className="results">
          <div className="result-head">
            <div>
              <h2>{search ? `Great matches for ${search}` : 'Recommended Teachers'}</h2>
              <p>{people.length} people teach skills you can learn.</p>
            </div>
            <button className="outline-btn mobile-filter">
              <SlidersHorizontal size={17} /> Filters
            </button>
          </div>

          <div className="reason-strip">
            <Filter size={17} />
            <span>
              <strong>How matching works:</strong> exact skill overlap is the biggest signal, then availability, format, rating, and session history.
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#68776f' }}>
              Finding the best matches...
            </div>
          ) : people.length > 0 ? (
            <div className="people-grid three">
              {people.map((person) => (
                <PersonCard
                  key={person._id || person.id}
                  person={person}
                  onRequestSession={(p) => setSelectedPerson(p)}
                  onViewProfile={(p) => navigate(`/profile/${p._id || p.id}`)}
                />
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', border: '1px solid #e4e9e3', borderRadius: '7px' }}>
              <h3>No teachers found for this search</h3>
              <p style={{ color: '#748278', fontSize: '13px', margin: '6px 0 16px' }}>
                Try adjusting your search terms or clearing filters.
              </p>
              <button className="dark-btn" onClick={clearFilters}>
                View all teachers
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedPerson && (
        <RequestSessionModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSuccess={() => {
            refreshUser();
            navigate('/sessions');
          }}
        />
      )}
    </section>
  );
}
