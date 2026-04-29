import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { storage, saveResume } from '../services/storage';
import { aiService } from '../services/gemini';
import { useToast } from '../context/ToastContext';
import './ResumeBuilder.css';

const ResumeBuilder = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const printRef = useRef();
  
  const user = storage.getUser();
  const savedResume = JSON.parse(localStorage.getItem('career_mentor_resume') || 'null');

  const [formData, setFormData] = useState({
    name: savedResume?.name || user?.name || '',
    email: savedResume?.email || user?.email || '',
    phone: savedResume?.phone || '',
    linkedin: savedResume?.linkedin || '',
    college: savedResume?.college || user?.college || '',
    degree: savedResume?.degree || '',
    year: savedResume?.year || user?.year || '2',
    cgpa: savedResume?.cgpa || '',
    skills: savedResume?.skills || '',
    projects: savedResume?.projects || [{ name: '', desc: '', tech: '', link: '' }],
    experience: savedResume?.experience || [{ company: '', role: '', duration: '', desc: '' }],
    languages: savedResume?.languages || '',
    domain: savedResume?.domain || user?.domain || ''
  });

  const [generatedResume, setGeneratedResume] = useState(savedResume?.generated || '');
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: true,
    skills: true,
    projects: true,
    experience: false,
    languages: true
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  document.title = 'Resume Builder | CareerMentor';

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSection = (section) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  const updateProject = (index, field, value) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  const addProject = () => {
    setFormData({ ...formData, projects: [...formData.projects, { name: '', desc: '', tech: '', link: '' }] });
  };

  const removeProject = (index) => {
    const newProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: newProjects });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData({ ...formData, experience: newExp });
  };

  const addExperience = () => {
    setFormData({ ...formData, experience: [...formData.experience, { company: '', role: '', duration: '', desc: '' }] });
  };

  const removeExperience = (index) => {
    const newExp = formData.experience.filter((_, i) => i !== index);
    setFormData({ ...formData, experience: newExp });
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const resumeText = await aiService.generateResume(formData, user.language);
      setGeneratedResume(resumeText);
      
      const fullData = { ...formData, generated: resumeText, generatedAt: new Date().toISOString() };
      saveResume(fullData);
      success('Resume generated successfully!');
    } catch (err) {
      error('Failed to generate resume');
    }
    setLoading(false);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResume);
    success('Copied to clipboard!');
  };

  return (
    <div className="resume-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('resume.title')}</h1>
          <p>{t('resume.subtitle')}</p>
        </header>

        <div className="resume-layout">
          <div className="resume-form">
            <div className={`form-section card ${expandedSections.personal ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('personal')}>
                <h3>{t('resume.personalInfo')}</h3>
                <span className="toggle-icon">{expandedSections.personal ? '−' : '+'}</span>
              </button>
              {expandedSections.personal && (
                <div className="section-body">
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">{t('name')}</label>
                      <input type="text" className="input" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('email')}</label>
                      <input type="email" className="input" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">{t('resume.phone')}</label>
                      <input type="tel" className="input" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('resume.linkedin')}</label>
                      <input type="url" className="input" value={formData.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`form-section card ${expandedSections.education ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('education')}>
                <h3>{t('education')}</h3>
                <span className="toggle-icon">{expandedSections.education ? '−' : '+'}</span>
              </button>
              {expandedSections.education && (
                <div className="section-body">
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">{t('college')}</label>
                      <input type="text" className="input" value={formData.college} onChange={(e) => handleChange('college', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('resume.degree')}</label>
                      <input type="text" className="input" value={formData.degree} onChange={(e) => handleChange('degree', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label">{t('year')}</label>
                      <select className="input select" value={formData.year} onChange={(e) => handleChange('year', e.target.value)}>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">{t('resume.cgpa')}</label>
                      <input type="text" className="input" value={formData.cgpa} onChange={(e) => handleChange('cgpa', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`form-section card ${expandedSections.skills ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('skills')}>
                <h3>{t('resume.skills')}</h3>
                <span className="toggle-icon">{expandedSections.skills ? '−' : '+'}</span>
              </button>
              {expandedSections.skills && (
                <div className="section-body">
                  <div className="input-group">
                    <label className="input-label">Skills (comma separated)</label>
                    <input type="text" className="input" placeholder="JavaScript, React, Python" value={formData.skills} onChange={(e) => handleChange('skills', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className={`form-section card ${expandedSections.projects ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('projects')}>
                <h3>{t('resume.projects')}</h3>
                <span className="toggle-icon">{expandedSections.projects ? '−' : '+'}</span>
              </button>
              {expandedSections.projects && (
                <div className="section-body">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="entry-block">
                      <div className="entry-header">
                        <span>Project {index + 1}</span>
                        {formData.projects.length > 1 && (
                          <button className="btn btn-ghost btn-sm" onClick={() => removeProject(index)}>Remove</button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                          <label className="input-label">{t('resume.projectName')}</label>
                          <input type="text" className="input" value={project.name} onChange={(e) => updateProject(index, 'name', e.target.value)} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('resume.techStack')}</label>
                          <input type="text" className="input" value={project.tech} onChange={(e) => updateProject(index, 'tech', e.target.value)} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">{t('resume.projectDesc')}</label>
                        <textarea className="input" rows={2} value={project.desc} onChange={(e) => updateProject(index, 'desc', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={addProject}>+ {t('resume.addProject')}</button>
                </div>
              )}
            </div>

            <div className={`form-section card ${expandedSections.experience ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('experience')}>
                <h3>{t('resume.experience')} (Optional)</h3>
                <span className="toggle-icon">{expandedSections.experience ? '−' : '+'}</span>
              </button>
              {expandedSections.experience && (
                <div className="section-body">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="entry-block">
                      <div className="entry-header">
                        <span>Experience {index + 1}</span>
                        {formData.experience.length > 1 && (
                          <button className="btn btn-ghost btn-sm" onClick={() => removeExperience(index)}>Remove</button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                          <label className="input-label">{t('resume.company')}</label>
                          <input type="text" className="input" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">{t('resume.role')}</label>
                          <input type="text" className="input" value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">{t('resume.duration')}</label>
                        <input type="text" className="input" value={exp.duration} onChange={(e) => updateExperience(index, 'duration', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={addExperience}>+ {t('resume.addExperience')}</button>
                </div>
              )}
            </div>

            <div className={`form-section card ${expandedSections.languages ? 'expanded' : ''}`}>
              <button className="section-header" onClick={() => toggleSection('languages')}>
                <h3>{t('resume.languages')}</h3>
                <span className="toggle-icon">{expandedSections.languages ? '−' : '+'}</span>
              </button>
              {expandedSections.languages && (
                <div className="section-body">
                  <div className="input-group">
                    <label className="input-label">Languages known</label>
                    <input type="text" className="input" placeholder="English, Hindi, Marathi" value={formData.languages} onChange={(e) => handleChange('languages', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={generateResume} disabled={loading}>
              {loading ? <><span className="spinner" /> Generating...</> : generatedResume ? t('resume.regenerate') : t('resume.generate')}
            </button>
          </div>

          <div className="resume-preview">
            <div className="preview-header">
              <h3>{t('resume.preview')}</h3>
              {generatedResume && (
                <div className="preview-actions">
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>Copy</button>
                  <button className="btn btn-primary btn-sm" onClick={handlePrint}>{t('resume.download')}</button>
                </div>
              )}
            </div>
            
            {generatedResume ? (
              <div className="preview-content card" ref={printRef}>
                <pre>{generatedResume}</pre>
              </div>
            ) : (
              <div className="preview-placeholder card">
                <p>Fill the form and click "Generate with AI" to see your resume</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
