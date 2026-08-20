import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FullRankings from './components/FullRankings';
import CompetitorModal from './components/CompetitorModal';
import CompetitionModal from './components/CompetitionModal';
import ShowsAndTiers from './components/ShowsAndTiers';
import AllTimeRankings from './components/AllTimeRankings';
import { computeRankingsFromDatabase, getCompetitionByName } from './services/databaseService';

export default function App() {
  const checkIsGoatUrl = () => {
    const pathname = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return pathname.includes('goat') || hash.includes('goat') || search.includes('goat') ||
           pathname.includes('alltime') || hash.includes('alltime');
  };

  const [activeTab, setActiveTabState] = useState(() => (checkIsGoatUrl() ? 'alltime' : 'all'));
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (tab === 'alltime') {
      window.history.pushState({}, '', '/goat');
    } else {
      if (checkIsGoatUrl()) {
        window.history.pushState({}, '', '/');
      }
    }
  };

  useEffect(() => {
    fetchRankings();

    const handleLocationChange = () => {
      if (checkIsGoatUrl()) {
        setActiveTabState('alltime');
      } else {
        setActiveTabState('all');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rankings/all?formula=EXPONENTIAL`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      } else {
        const dbRankings = computeRankingsFromDatabase();
        setRankings(dbRankings);
      }
    } catch (err) {
      console.warn("Using local database decisioning engine:", err);
      const dbRankings = computeRankingsFromDatabase();
      setRankings(dbRankings);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompetition = (compOrName, isAllTimeOverride) => {
    if (!compOrName) return;
    const isAllTime = isAllTimeOverride !== undefined ? isAllTimeOverride : (activeTab === 'alltime');
    if (typeof compOrName === 'string') {
      const found = getCompetitionByName(compOrName, isAllTime);
      setSelectedCompetition(found || { name: compOrName, contest_name: compOrName, isAllTime });
    } else {
      setSelectedCompetition({ ...compOrName, isAllTime });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-dew-green font-mono text-lg animate-pulse">LOADING RANKINGS ENGINE...</div>
          </div>
        )}

        {!loading && activeTab === 'all' && (
          <FullRankings
            rankings={rankings}
            onSelectCompetitor={setSelectedCompetitor}
            formula="EXPONENTIAL"
          />
        )}

        {activeTab === 'shows' && (
          <ShowsAndTiers
            onSelectCompetition={handleSelectCompetition}
          />
        )}

        {activeTab === 'alltime' && (
          <AllTimeRankings
            onSelectCompetitor={setSelectedCompetitor}
          />
        )}
      </main>

      {/* Competitor Profile Modal */}
      {selectedCompetitor && (
        <CompetitorModal
          athlete={selectedCompetitor}
          onClose={() => setSelectedCompetitor(null)}
          onSelectCompetition={handleSelectCompetition}
        />
      )}

      {/* Competition Decisioning Math Modal */}
      {selectedCompetition && (
        <CompetitionModal
          competition={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
        />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
