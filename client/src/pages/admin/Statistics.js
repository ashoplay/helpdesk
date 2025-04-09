import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/tickets/stats/roles');
        setStats(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Feil ved henting av statistikk');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading">Laster statistikk...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="statistics-page">
      <h1>Saksstatistikk</h1>
      <div className="stats-container">
        {stats && stats.map(roleStat => (
          <div key={roleStat._id || 'unassigned'} className="stat-card">
            <h3>{roleStat._id === '1. linje' ? '1. linje' : 
                 roleStat._id === '2. linje' ? '2. linje' : 
                 roleStat._id === 'unassigned' ? 'Ikke tildelt' : roleStat._id}</h3>
            <p>Totalt antall saker: {roleStat.totalTickets}</p>
            <div className="status-breakdown">
              {roleStat.statuses.map(status => (
                <div key={status.status} className="status-item">
                  <span className="status-label">{status.status}:</span>
                  <span className="status-count">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
