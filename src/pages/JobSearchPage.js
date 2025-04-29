import React from 'react';
import JobSearch from '../components/JobSearch';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import '../pagesCss/JobSearchPage.css';

const JobSearchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="job-search-page">
      <div className="job-search-header">
        <h1>Job Search</h1>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back
        </Button>
      </div>
      <div className="job-search-content">
        <JobSearch />
      </div>
    </div>
  );
};

export default JobSearchPage;