import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './CommunityPage.css';

const CommunityPage = () => {
  const groups = [
    {
      title: 'Queries',
      description: 'Get your questions answered by the community',
      link: 'https://chat.whatsapp.com/LePg4ltM0FKHCwh20gTdhP'
    },
    {
      title: 'Ask a Senior',
      description: 'Connect with seniors for guidance and mentorship',
      link: 'https://chat.whatsapp.com/ENBqVc3sGOpBgmurkdQSJi'
    },
    {
      title: 'Internship and Job Postings',
      description: 'Stay updated with latest opportunities',
      link: 'https://chat.whatsapp.com/HvmJNHEsd855PifQRwLuZM'
    },
    {
      title: 'Community',
      description: 'Join the main community group',
      link: 'https://chat.whatsapp.com/JG5FGborBXvBWvE7ykEy1U'
    }
  ];

  return (
    <div className="community-page">
      <h1>Community Groups</h1>
      <p className="community-intro">
        Join our WhatsApp groups to connect with fellow students, get your queries answered,
        and stay updated with the latest opportunities.
      </p>
      
      <div className="groups-container">
        {groups.map((group, index) => (
          <a
            key={index}
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group-card"
          >
            <div className="group-icon">
              <FaWhatsapp size={24} />
            </div>
            <div className="group-content">
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </div>
            <div className="group-arrow">
              <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CommunityPage; 