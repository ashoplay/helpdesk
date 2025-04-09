import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RoleStatistics = () => {
  const [roleStats, setRoleStats] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get ticket stats by role
        const roleRes = await axios.get('/api/tickets/stats/roles');
        setRoleStats(roleRes.data.data);

        // Get feedback stats
        const feedbackRes = await axios.get('/api/feedback/stats');
        setFeedbackStats(feedbackRes.data.data);

        setLoading(false);
      } catch (err) {
        setError('Error fetching statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format data for charts
  const formatRoleData = () => {
    return roleStats.map(role => ({
      name: role._id === 'unassigned' ? 'Unassigned' : 
            role._id === '1. linje' ? '1st Line' : 
            role._id === '2. linje' ? '2nd Line' : role._id,
      totalTickets: role.totalTickets,
      openTickets: role.statuses.find(s => s.status === 'Åpen')?.count || 0,
      inProgressTickets: role.statuses.find(s => s.status === 'Under arbeid')?.count || 0,
      resolvedTickets: role.statuses.find(s => s.status === 'Løst')?.count || 0
    }));
  };

  const formatFeedbackData = () => {
    return feedbackStats.map(stat => ({
      name: stat._id === 'unassigned' ? 'Unassigned' : 
            stat._id === '1. linje' ? '1st Line' : 
            stat._id === '2. linje' ? '2nd Line' : stat._id,
      averageRating: stat.averageRating,
      count: stat.count
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="role-statistics">
      <h1>Role Statistics</h1>
      
      <div className="stats-grid">
        <div className="card">
          <div className="card-header">
            <h2>Tickets by Role</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatRoleData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="openTickets" name="Open" stackId="a" fill="#FF8042" />
                <Bar dataKey="inProgressTickets" name="In Progress" stackId="a" fill="#FFBB28" />
                <Bar dataKey="resolvedTickets" name="Resolved" stackId="a" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Feedback Ratings by Role</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatFeedbackData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageRating" name="Average Rating (1-5)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="feedback-stats">
              {formatFeedbackData().map((stat, index) => (
                <div key={index} className="stat-card">
                  <h3>{stat.name}</h3>
                  <p>Average Rating: <strong>{stat.averageRating.toFixed(1)}</strong>/5</p>
                  <p>Based on {stat.count} ratings</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleStatistics;
