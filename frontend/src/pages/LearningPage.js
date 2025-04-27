import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LearningPage = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get('/api/learning');
        console.log('Fetched modules:', response.data); // Add this
        setModules(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching learning modules:', error);
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) return <div>Loading learning modules...</div>;

  // Group modules by difficulty
  const beginnerModules = modules.filter(module => module.difficulty === 'Beginner');
  const intermediateModules = modules.filter(module => module.difficulty === 'Intermediate');
  const advancedModules = modules.filter(module => module.difficulty === 'Advanced');

  return (
    <div className="learning-page">
      <h1>Stock Market Learning Center</h1>
      <p>Enhance your knowledge and become a better investor</p>

      {beginnerModules.length > 0 && (
        <div className="module-section">
          <h2>Beginner Modules</h2>
          <div className="module-cards">
            {beginnerModules.map(module => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                <Link to={`/learning/${module._id}`} className="btn btn-primary">
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {intermediateModules.length > 0 && (
        <div className="module-section">
          <h2>Intermediate Modules</h2>
          <div className="module-cards">
            {intermediateModules.map(module => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                <Link to={`/learning/${module._id}`} className="btn btn-primary">
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {advancedModules.length > 0 && (
        <div className="module-section">
          <h2>Advanced Modules</h2>
          <div className="module-cards">
            {advancedModules.map(module => (
              <div key={module._id} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span>{module.estimatedTime} minutes</span>
                </div>
                <Link to={`/learning/${module._id}`} className="btn btn-primary">
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPage;