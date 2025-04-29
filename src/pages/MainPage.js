import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagesCss/MainPage.css'; // Your updated CSS file
import { Card, CardContent, Typography, Button } from '@mui/material';

const MainPage = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;
  
  const mainCards = [
    {
      title: "Profile",
      description: "View and edit your profile information. Update your photo, experience, and skills.",
      color: "#FF6B6B",
      onClick: () => navigate(`/profile/${userId}`)
    },
    {
      title: "Home Feed",
      description: "View posts from people you follow and stay updated with your professional network.",
      color: "#4ECDC4",
      onClick: () => navigate('/home')
    },
    {
      title: "Job Search",
      description: "Find job opportunities tailored to your skills and experience. Apply with just a few clicks.",
      color: "#45B7D1",
      onClick: () => navigate('/jobs')
    },
    {
      title: "Paper",
      description: "Search for academic papers and conferences. Find and explore research publications in your field.",
      color: "#A593E0",
      onClick: () => window.open("https://paper-61h7.onrender.com", "_blank")
    }
  ];

  return (
    <div className="main-page-container">
      <div className="main-page-header">
        <h1>Welcome to Vizz</h1>
        <p>Choose where you want to go</p>
      </div>
      
      <div className="cards-container">
        <div className="cards-row">
          {mainCards.map((card, index) => (
            <Card 
              key={index} 
              className="main-card" 
              style={{ backgroundColor: card.color }}
              onClick={card.onClick}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  {card.title}
                </Typography>
                <Typography variant="body2">
                  {card.description}
                </Typography>
                <Button 
                  variant="contained" 
                  style={{ backgroundColor: 'white', color: card.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    card.onClick();
                  }}
                >
                  Go
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;