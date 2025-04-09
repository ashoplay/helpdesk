import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get('/api/tickets');
        setTickets(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {user && user.name}</p>
      
      <Link to="/tickets/new" className="btn btn-primary">
        Opprett ny billett
      </Link>
      
      <h2>Dine billetter</h2>
      
      {tickets.length === 0 ? (
        <p>Du har ikke opprettet noen billetter ennå.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tittel</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Prioritet</th>
                <th>Opprettet</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>{ticket.title}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/tickets/${ticket._id}`} className="btn btn-secondary btn-sm">
                      Vis
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
