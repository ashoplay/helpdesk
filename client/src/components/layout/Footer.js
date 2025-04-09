import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Helpdesk System</p>
      </div>
    </footer>
  );
};

export default Footer;
