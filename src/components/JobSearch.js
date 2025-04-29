import React, { useState } from 'react';
import axios from 'axios';

const JobSearch = () => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [pages, setPages] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/search-jobs', {
        keywords,
        location,
        num_pages: pages
      });
      setJobs(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Job search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-search-container">
      <h3>Job Search</h3>
      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label>Job Title/Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. Python Developer"
            required
          />
        </div>
        <div className="form-group">
          <label>Location (Optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New York"
          />
        </div>
        <div className="form-group">
          <label>Pages</label>
          <select value={pages} onChange={(e) => setPages(parseInt(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="job-results">
        {jobs.length > 0 && (
          <div className="results-count">Found {jobs.length} jobs:</div>
        )}
        {jobs.map((job) => (
          <div key={`${job.title}-${job.company}`} className="job-card">
            <div className="job-source">{job.source}</div>
            <h4>{job.title}</h4>
            <p className="company-location">
              {job.company} - {job.location}
            </p>
            {job.salary && (
              <p className="salary">
                <strong>Salary:</strong> {job.salary}
              </p>
            )}
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              View Job
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobSearch;