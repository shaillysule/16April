import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LearningModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await axios.get(`/api/learning/${id}`);
        setModule(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching module:', error);
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  if (loading) return <div>Loading learning content...</div>;
  if (!module) return <div>Module not found</div>;

  const handleNext = () => {
    if (currentSection < module.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    
    module.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = (correctAnswers / module.quiz.length) * 100;
    setScore(finalScore);
    setQuizSubmitted(true);
  };

  return (
    <div className="learning-module">
      <div className="module-header">
        <h1>{module.title}</h1>
        <div className="progress-indicator">
          {!showQuiz ? (
            <span>Section {currentSection + 1} of {module.sections.length}</span>
          ) : (
            <span>Quiz</span>
          )}
        </div>
      </div>

      {!showQuiz ? (
        // Section content
        <div className="section-content">
          <h2>{module.sections[currentSection].title}</h2>
          <div 
            className="content-html"
            dangerouslySetInnerHTML={{ __html: module.sections[currentSection].content }}
          />
          
          {module.sections[currentSection].videoUrl && (
            <div className="video-container">
              <video 
                controls 
                width="100%" 
                src={module.sections[currentSection].videoUrl}
              />
            </div>
          )}
          
          {module.sections[currentSection].imageUrl && (
            <div className="image-container">
              <img 
                src={module.sections[currentSection].imageUrl} 
                alt={module.sections[currentSection].title} 
              />
            </div>
          )}
          
          <div className="navigation-buttons">
            <button 
              onClick={handlePrevious} 
              disabled={currentSection === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button 
              onClick={handleNext}
              className="btn btn-primary"
            >
              {currentSection < module.sections.length - 1 ? 'Next' : 'Take Quiz'}
            </button>
          </div>
        </div>
      ) : (
        // Quiz content
        <div className="quiz-container">
          <h2>Test Your Knowledge</h2>
          
          {!quizSubmitted ? (
            <>
              {module.quiz.map((question, qIndex) => (
                <div key={qIndex} className="quiz-question">
                  <h3>Question {qIndex + 1}: {question.question}</h3>
                  <div className="options">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="option">
                        <input 
                          type="radio" 
                          id={`q${qIndex}-o${oIndex}`}
                          name={`question-${qIndex}`}
                          checked={quizAnswers[qIndex] === oIndex}
                          onChange={() => handleAnswerSelect(qIndex, oIndex)}
                        />
                        <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length !== module.quiz.length}
                className="btn btn-success"
              >
                Submit Answers
              </button>
            </>
          ) : (
            <div className="quiz-results">
              <h3>Your Score: {score.toFixed(0)}%</h3>
              <p>You answered {Math.round((score / 100) * module.quiz.length)} out of {module.quiz.length} questions correctly.</p>
              
              <button 
                onClick={() => navigate('/learning')}
                className="btn btn-primary"
              >
                Back to Learning Modules
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningModule;