import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats');
        setStats(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user && user.name}</p>
      
      {stats && (
        <div className="stats-overview">
          <div className="stats-cards">
            <div className="card">
              <div className="card-body">
                <h3>Tickets by Status</h3>
                <ul>
                  <li>Open: {stats.statusStats.Åpen}</li>
                  <li>In Progress: {stats.statusStats['Under arbeid']}</li>
                  <li>Resolved: {stats.statusStats.Løst}</li>
                </ul>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <h3>Tickets by Priority</h3>
                <ul>
                  <li>Low: {stats.priorityStats.Lav}</li>
                  <li>Medium: {stats.priorityStats.Medium}</li>
                  <li>High: {stats.priorityStats.Høy}</li>
                </ul>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <h3>Users</h3>
                <ul>
                  <li>Regular Users: {stats.userCount}</li>
                  <li>Administrators: {stats.adminCount}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="recent-tickets">
            <h3>Recent Tickets</h3>
            
            {stats.recentTickets.length === 0 ? (
              <p>No tickets found.</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentTickets.map(ticket => (
                      <tr key={ticket._id}>
                        <td>{ticket.title}</td>
                        <td>{ticket.createdBy.name}</td>
                        <td>{ticket.status}</td>
                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/admin/tickets/${ticket._id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <Link to="/admin/tickets" className="btn btn-primary">
            Manage All Tickets
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
