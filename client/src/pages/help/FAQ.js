import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'Hvordan sjekker jeg status på billetten min?',
      answer: 'Logg inn på kontoen din og gå til Dashbordet. Der vil du se alle billettene dine med gjeldende status. Klikk på en billett for å se detaljer og historikk.'
    },
    {
      question: 'Kan jeg legge til mer informasjon i en billett etter at den er sendt inn?',
      answer: 'Ja, du kan legge til kommentarer på billetten din når som helst. Dette er nyttig for å gi tilleggsinformasjon eller svare på spørsmål fra vårt supportteam.'
    },
    {
      question: 'Hva betyr de forskjellige billett-statusene?',
      answer: '"Åpen" betyr at billetten din er sendt inn, men ikke adressert ennå. "Under arbeid" betyr at teamet vårt jobber aktivt med saken. "Løst" betyr at problemet er løst eller besvart.'
    },
    {
      question: 'Hvordan gir jeg tilbakemelding på løste billetter?',
      answer: 'Når billetten din er markert som "Løst", vil du se et tilbakemeldingsskjema på billettens detaljside. Du kan gi din vurdering og legge igjen kommentarer om opplevelsen din.'
    },
    {
      question: 'How do I create a new support ticket?',
      answer: 'To create a new support ticket, log in to your account, click on the "New Ticket" button in the navigation menu, fill out the form with details about your issue, and submit it.'
    },
    {
      question: 'How long will it take to get a response to my ticket?',
      answer: 'Our support team aims to respond to all tickets within 24 hours during business days. Complex issues may take longer to resolve, but youll receive regular updates on progress.'
    },
    {
      question: 'What information should I include in my ticket?',
      answer: 'Include a descriptive title, select the appropriate category, and provide detailed information about your issue. Screenshots or error messages are helpful. The more information you provide, the faster we can help you.'
    },
    {
      question: 'How do I check the status of my ticket?',
      answer: 'Log in to your account and go to the Dashboard. Youll see all your tickets listed with their current status. Click on any ticket to see its details and history.'
    },
    {
      question: 'Can I add more information to a ticket after submitting it?',
      answer: 'Yes, you can add comments to your ticket at any time. This is useful for providing additional information or responding to questions from our support team.'
    },
    {
      question: 'What do the different ticket statuses mean?',
      answer: '"Open" means your ticket has been submitted but not yet addressed. "In Progress" means our team is actively working on your issue. "Resolved" means the issue has been fixed or answered.'
    },
    {
      question: 'How do I provide feedback on resolved tickets?',
      answer: 'Once your ticket is marked as "Resolved", youll see a feedback form on the ticket details page. You can rate your satisfaction and leave comments about your experience.'
    },
    {
      question: 'What is the difference between 1st and 2nd line support?',
      answer: '1st line support handles general issues and common problems. 2nd line support consists of specialists who handle more complex or technical issues that require deeper expertise.'
    },
    {
      question: 'Can I reopen a resolved ticket?',
      answer: 'No, once a ticket is resolved, you should create a new ticket if the issue persists or returns. Please reference the original ticket number in your new submission.'
    },
    {
      question: 'How do I change my account information?',
      answer: 'Go to your Profile page by clicking on your name in the navigation menu. From there, you can update your personal information.'
    }
  ];

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <div className="faq-page">
      <h1>Frequently Asked Questions</h1>
      
      <div className="search-box">
        <input 
          type="text" 
          className="form-control"
          placeholder="Search FAQs..." 
        />
      </div>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div className="faq-item card" key={index}>
            <div 
              className="faq-question" 
              onClick={() => toggleFAQ(index)}
            >
              <h3>{faq.question}</h3>
              <span className="toggle-icon">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="need-more-help">
        <h2>Need More Help?</h2>
        <p>If your question isn't answered here, please create a support ticket and our team will assist you.</p>
        <button className="btn btn-primary">Create a Ticket</button>
      </div>
    </div>
  );
};

export default FAQ;
