import React, { useEffect, useState } from 'react';
import './Works.css';
import brief from '../assets/briefcase.png';
import ideas from '../assets/ideas.png';
import profile from '../assets/profile.png';
import { Infocard } from './Infocard';

export const Works = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const workCards = [
    {
      id: 1,
      infoimage: profile,
      heading: 'Create Your Profile',
      description:
        'Build a professional profile showcasing your skills and experience.',
      fullDescription: [
        'Start by building a strong and professional profile that clearly represents who you are. Add your skills, experience, education, and career goals so recruiters can quickly understand your background.',
        'Upload your resume, highlight your key projects, and showcase your achievements to stand out from other candidates. A well-structured profile increases visibility and improves your chances of getting shortlisted.',
        'Keep your profile updated with the latest skills and certifications. The more complete and accurate your profile is, the higher your chances of receiving relevant job recommendations and recruiter attention.',
        'A powerful profile acts as your digital identity — make it impactful, clear, and aligned with your career goals.',
      ],
    },
    {
      id: 2,
      infoimage: ideas,
      heading: 'Explore Opportunities',
      description:
        'Browse thousands of jobs tailored to your preferences and apply easily.',
      fullDescription: [
        'Explore a wide range of job opportunities tailored to your skills, experience, and career interests. Use smart filters to find jobs based on location, salary, role, and company preferences.',
        'Get access to thousands of listings from top companies and startups. Save jobs, track your interests, and apply quickly without repeating the same steps every time.',
        'Stay ahead with real-time job updates and personalized recommendations. Our system continuously analyzes your profile to match you with the most relevant opportunities.',
        'Make your job search efficient and focused by discovering roles that truly match your potential and aspirations.',
      ],
    },
    {
      id: 3,
      infoimage: brief,
      heading: 'Land Your Dream Job',
      description:
        'Connect with top employers and take the next step in your career.',
      fullDescription: [
        'Take the final step toward your career goals by connecting with top employers. Apply confidently and track every stage of your application in one place.',
        'Receive instant updates on application status, interview schedules, and recruiter responses. Stay informed and never miss an opportunity.',
        'Prepare better with insights, tips, and notifications designed to help you succeed in interviews and stand out among other candidates.',
        'Turn your efforts into results by securing the job that aligns with your passion, skills, and long-term career vision.',
      ],
    },
  ];

  const openModal = (card) => {
    setSelectedCard(card);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      setIsModalVisible(true);
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);

    setTimeout(() => {
      setSelectedCard(null);
      document.body.style.overflow = 'auto';
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCard) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedCard]);

  return (
    <>
      <section className='works-section'>
        <h2 className='work-heading'>How It Works ?</h2>

        <div className='infocard-section'>
          {workCards.map((card) => (
            <div
              key={card.id}
              className='infocard-wrapper'
              onClick={() => openModal(card)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  openModal(card);
                }
              }}
            >
              <Infocard
                infoimage={card.infoimage}
                heading={card.heading}
                description={card.description}
              />
            </div>
          ))}
        </div>
      </section>

      {selectedCard && (
        <div
          className={`works-modal-overlay ${isModalVisible ? 'show' : ''}`}
          onClick={closeModal}
        >
          <div
            className={`works-modal ${isModalVisible ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-labelledby='works-modal-title'
          >
            <button
              className='works-modal-close'
              onClick={closeModal}
              aria-label='Close popup'
              type='button'
            >
              ×
            </button>

            <div className='works-modal-icon'>
              <img src={selectedCard.infoimage} alt={selectedCard.heading} />
            </div>

            <h3 id='works-modal-title' className='works-modal-title'>
              {selectedCard.heading}
            </h3>

            <div className='works-modal-content'>
              {selectedCard.fullDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};