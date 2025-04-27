import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LearningModuleAdmin = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    estimatedTime: 10,
    sections: [{ title: '', content: '', videoUrl: '', imageUrl: '' }],
    quiz: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/learning');
      setModules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load learning modules');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({
      ...formData,
      sections: newSections
    });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { title: '', content: '', videoUrl: '', imageUrl: '' }]
    });
  };

  const removeSection = (index) => {
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData({
      ...formData,
      sections: newSections
    });
  };

  const handleQuizChange = (questionIndex, field, value, optionIndex = null) => {
    const newQuiz = [...formData.quiz];
    
    if (field === 'options' && optionIndex !== null) {
      newQuiz[questionIndex].options[optionIndex] = value;
    } else {
      newQuiz[questionIndex][field] = value;
    }
    
    setFormData({
      ...formData,
      quiz: newQuiz
    });
  };

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quiz: [...formData.quiz, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const removeQuizQuestion = (index) => {
    const newQuiz = [...formData.quiz];
    newQuiz.splice(index, 1);
    setFormData({
      ...formData,
      quiz: newQuiz
    });
  };

  const handleEdit = (module) => {
    setFormData({
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimatedTime: module.estimatedTime,
      sections: module.sections || [{ title: '', content: '', videoUrl: '', imageUrl: '' }],
      quiz: module.quiz || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
    setEditingId(module._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/learning/${editingId}`, formData);
      } else {
        await axios.post('/api/learning', formData);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        difficulty: 'Beginner',
        estimatedTime: 10,
        sections: [{ title: '', content: '', videoUrl: '', imageUrl: '' }],
        quiz: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      });
      setEditingId(null);
      
      // Refresh modules list
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      setError('Failed to save module');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await axios.delete(`/api/learning/${id}`);
        fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        setError('Failed to delete module');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="learning-module-admin">
      <h1>{editingId ? 'Edit Learning Module' : 'Create Learning Module'}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <div className="form-group col-md-6">
            <label>Estimated Time (minutes)</label>
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>
        
        <h3>Sections</h3>
        {formData.sections.map((section, index) => (
          <div key={index} className="section-form border p-3 mb-3">
            <h4>Section {index + 1}</h4>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Content (HTML supported)</label>
              <textarea
                value={section.content}
                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                required
                className="form-control"
                rows="5"
              />
            </div>
            
            <div className="form-group">
              <label>Video URL (optional)</label>
              <input
                type="text"
                value={section.videoUrl}
                onChange={(e) => handleSectionChange(index, 'videoUrl', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input
                type="text"
                value={section.imageUrl}
                onChange={(e) => handleSectionChange(index, 'imageUrl', e.target.value)}
                className="form-control"
              />
            </div>
            
            {formData.sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="btn btn-danger"
              >
                Remove Section
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addSection}
          className="btn btn-secondary mb-3"
        >
          Add Section
        </button>
        
        <h3>Quiz Questions</h3>
        {formData.quiz.map((question, qIndex) => (
          <div key={qIndex} className="quiz-form border p-3 mb-3">
            <h4>Question {qIndex + 1}</h4>
            
            <div className="form-group">
              <label>Question</label>
              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuizChange(qIndex, 'question', e.target.value)}
                required
                className="form-control"
              />
            </div>
            
            <div className="options-container">
              <label>Options</label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <div className="input-group-text">
                        <input
                          type="radio"
                          checked={question.correctAnswer === oIndex}
                          onChange={() => handleQuizChange(qIndex, 'correctAnswer', oIndex)}
                          required
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleQuizChange(qIndex, 'options', e.target.value, oIndex)}
                      placeholder={`Option ${oIndex + 1}`}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {formData.quiz.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuizQuestion(qIndex)}
                className="btn btn-danger"
              >
                Remove Question
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addQuizQuestion}
          className="btn btn-secondary mb-3"
        >
          Add Question
        </button>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update Module' : 'Create Module'}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  difficulty: 'Beginner',
                  estimatedTime: 10,
                  sections: [{ title: '', content: '', videoUrl: '', imageUrl: '' }],
                  quiz: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                });
                setEditingId(null);
              }}
              className="btn btn-secondary ml-2"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      
      <h2 className="mt-5">Learning Modules</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Difficulty</th>
            <th>Sections</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(module => (
            <tr key={module._id}>
              <td>{module.title}</td>
              <td>{module.difficulty}</td>
              <td>{module.sections ? module.sections.length : 0}</td>
              <td>
                <button
                  onClick={() => handleEdit(module)}
                  className="btn btn-sm btn-primary mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(module._id)}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LearningModuleAdmin;