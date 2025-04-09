import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1>Helpdesk Ticket System</h1>
          </div>
          <div className="card-body">
            <p>
              Welcome to our helpdesk ticket management system. This platform allows 
              users to submit support requests and administrators to manage them.
            </p>
            <p>
              If you're experiencing any technical issues, please log in and submit a ticket.
              Our support team will respond as soon as possible.
            </p>
            <div className="buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
