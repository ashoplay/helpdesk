import React, { useState } from 'react';

const UserManual = () => {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="user-manual">
      <h1>User Manual</h1>
      
      <div className="tab-navigation">
        <button 
          onClick={() => setActiveTab('user')} 
          className={`btn ${activeTab === 'user' ? 'btn-primary' : 'btn-secondary'}`}
        >
          For Users
        </button>
        <button 
          onClick={() => setActiveTab('firstline')} 
          className={`btn ${activeTab === 'firstline' ? 'btn-primary' : 'btn-secondary'}`}
        >
          For 1st Line Support
        </button>
        <button 
          onClick={() => setActiveTab('secondline')} 
          className={`btn ${activeTab === 'secondline' ? 'btn-primary' : 'btn-secondary'}`}
        >
          For 2nd Line Support
        </button>
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          For Administrators
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'user' && (
          <div className="card">
            <div className="card-header">
              <h2>User Guide</h2>
            </div>
            <div className="card-body">
              <h3>Creating a Ticket</h3>
              <ol>
                <li>Log in to your account</li>
                <li>Click on "New Ticket" in the navigation menu</li>
                <li>Fill out the ticket form with:
                  <ul>
                    <li>A descriptive title</li>
                    <li>Select the appropriate category</li>
                    <li>Provide a detailed description of your issue</li>
                  </ul>
                </li>
                <li>Submit the ticket</li>
              </ol>

              <h3>Viewing Your Tickets</h3>
              <ol>
                <li>Log in to your account</li>
                <li>Gå til "Dashbord" for å se alle billettene dine</li>
                <li>Klikk på en billett for å se detaljer</li>
                <li>Du kan legge til kommentarer for å gi ytterligere informasjon</li>
              </ol>

              <h3>Gi tilbakemelding</h3>
              <ol>
                <li>Når billetten din er markert som "Løst", vil du se et tilbakemeldingsskjema</li>
                <li>Vurder hvor fornøyd du er med løsningen (1-5 stjerner)</li>
                <li>Legg gjerne til kommentarer om opplevelsen din</li>
                <li>Send inn tilbakemeldingen</li>
              </ol>
            </div>
          </div>
        )}
        
        {activeTab === 'firstline' && (
          <div className="card">
            <div className="card-header">
              <h2>1. linje support guide</h2>
            </div>
            <div className="card-body">
              <h3>Håndtering av tildelte billetter</h3>
              <ol>
                <li>Logg inn med din 1. linje support-konto</li>
                <li>Your dashboard will show tickets assigned to 1st line support</li>
                <li>You can filter tickets by status (Open, In Progress, Resolved)</li>
                <li>Click on a ticket to view its details and work on it</li>
              </ol>

              <h3>Updating Tickets</h3>
              <ol>
                <li>When working on a ticket, change its status to "In Progress"</li>
                <li>Add comments to communicate with the user</li>
                <li>If you resolve the issue, change status to "Resolved"</li>
                <li>If the issue requires more advanced support, notify an administrator to reassign it to 2nd line support</li>
              </ol>

              <h3>Best Practices</h3>
              <ul>
                <li>Always respond to tickets within 24 hours</li>
                <li>Document all steps taken in the ticket comments</li>
                <li>Be clear and concise in your communications</li>
                <li>If you're stuck, don't hesitate to escalate the ticket</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'secondline' && (
          <div className="card">
            <div className="card-header">
              <h2>2nd Line Support Guide</h2>
            </div>
            <div className="card-body">
              <h3>Handling Complex Issues</h3>
              <ol>
                <li>Log in with your 2nd line support account</li>
                <li>Your dashboard shows tickets assigned to 2nd line support</li>
                <li>These tickets typically require more technical expertise</li>
                <li>Review any previous comments and actions by 1st line support</li>
              </ol>

              <h3>Technical Resolutions</h3>
              <ol>
                <li>Document your troubleshooting process in ticket comments</li>
                <li>When resolving complex issues, include detailed explanations</li>
                <li>If a permanent fix isn't possible, document workarounds clearly</li>
                <li>For recurring issues, suggest preventive measures</li>
              </ol>

              <h3>Knowledge Sharing</h3>
              <ul>
                <li>Document common solutions for the knowledge base</li>
                <li>Provide guidance to 1st line support when appropriate</li>
                <li>Suggest system improvements to prevent future issues</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'admin' && (
          <div className="card">
            <div className="card-header">
              <h2>Administrator Guide</h2>
            </div>
            <div className="card-body">
              <h3>User Management</h3>
              <ol>
                <li>Go to the "Users" section in the admin dashboard</li>
                <li>You can view all users and their current roles</li>
                <li>To change a role, select a user and assign a new role (User, 1st Line, 2nd Line, Admin)</li>
                <li>You can also assign users to companies</li>
              </ol>

              <h3>Ticket Management</h3>
              <ol>
                <li>You have full access to view, edit, and delete tickets</li>
                <li>Note that tickets can only be deleted after they're resolved</li>
                <li>You can assign tickets to either 1st or 2nd line support</li>
                <li>Use filters and search to efficiently manage large numbers of tickets</li>
              </ol>

              <h3>Analytics and Reporting</h3>
              <ul>
                <li>View statistics on ticket volumes by role, status, and priority</li>
                <li>Monitor feedback ratings to evaluate support quality</li>
                <li>Use company views to see all tickets from specific organizations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManual;
