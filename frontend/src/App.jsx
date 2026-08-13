import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FullRankings from './components/FullRankings';
import CompetitorModal from './components/CompetitorModal';
import ShowsAndTiers from './components/ShowsAndTiers';
import { computeRankingsFromDatabase } from './services/databaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  useEffect(() => {
    fetchRankings();
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
          <ShowsAndTiers />
        )}
      </main>

      {/* Competitor Profile Modal */}
      {selectedCompetitor && (
        <CompetitorModal
          athlete={selectedCompetitor}
          onClose={() => setSelectedCompetitor(null)}
        />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
