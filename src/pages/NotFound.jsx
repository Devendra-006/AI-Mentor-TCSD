import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const user = storage.getUser();

  useEffect(() => {
    document.title = '404 — Page Not Found | CareerMentor';
  }, []);

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="notfound-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            {user ? 'Go to Dashboard' : 'Go to Login'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
