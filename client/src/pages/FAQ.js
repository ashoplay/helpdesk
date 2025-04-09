import React, { useState } from 'react';

const FAQ = () => {
  // State to track which questions are expanded
  const [activeIndex, setActiveIndex] = useState(null);

  // FAQ data
  const faqs = [
    {
      question: 'Hvordan oppretter jeg en ny sak?',
      answer: 'For å opprette en ny sak, logg inn på din konto, klikk på "Opprett Sak"-knappen i navigasjonsmenyen. Fyll ut skjemaet med en beskrivende tittel, velg kategorien som best passer ditt problem, og gi en detaljert beskrivelse av problemet ditt.'
    },
    {
      question: 'Hvordan sjekker jeg status på sakene mine?',
      answer: 'Du kan se alle dine saker og deres statuser ved å logge inn og gå til din Dashboard. Her vil du se en liste over alle dine åpne og løste saker. Klikk på en sak for å se detaljer og kommunikasjonshistorikken.'
    },
    {
      question: 'Hva betyr de ulike statusene på sakene?',
      answer: 'Vi bruker følgende statuser for saker: "Åpen" betyr at saken er registrert men ikke tatt opp ennå, "Under arbeid" betyr at support-teamet jobber med saken din, og "Løst" betyr at problemet er løst.'
    },
    {
      question: 'Hvordan legger jeg til mer informasjon i en eksisterende sak?',
      answer: 'Åpne saken du ønsker å oppdatere ved å klikke på den i Dashboard. Nederst på siden finner du et kommentarfelt hvor du kan legge til mer informasjon eller svare på spørsmål fra support-teamet.'
    },
    {
      question: 'Hvem ser sakene mine?',
      answer: 'Dine saker er synlige for deg og vårt support-team. Avhengig av kompleksiteten i saken din, kan den bli tildelt enten til første- eller andrelinje-support.'
    },
    {
      question: 'Hvordan endrer jeg passordet mitt?',
      answer: 'Gå til "Min Profil" i navigasjonsmenyen etter at du har logget inn. Her finner du et skjema for å endre passordet ditt. Du må oppgi ditt nåværende passord for sikkerhetens skyld.'
    },
    {
      question: 'Hva gjør jeg hvis jeg glemmer passordet mitt?',
      answer: 'På innloggingssiden finner du en "Glemt passord"-lenke. Klikk på denne og følg instruksjonene for å tilbakestille passordet ditt via e-post.'
    }
  ];

  // Toggle the active FAQ
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <h1>Vanlige Spørsmål (FAQ)</h1>
      <p className="faq-intro">
        Her finner du svar på de mest stilte spørsmålene om vårt helpdesk-system. Hvis du ikke finner svaret du leter etter, kan du kontakte support-teamet vårt.
      </p>
      
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <div 
              className={`faq-question ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <h3>{faq.question}</h3>
              <span className="faq-toggle">{activeIndex === index ? '-' : '+'}</span>
            </div>
            {activeIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
