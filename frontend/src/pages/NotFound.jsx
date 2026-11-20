import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';

export default function NotFound() {
  return (
    <div className="page">
      <div className="error-card">
        <span className="error-card__icon">
          <Icon name="compass" size={24} />
        </span>
        <h3>Page not found</h3>
        <p>That route is not part of the Cascadja Cafe analytics dashboard.</p>
        <Link className="btn btn--primary" to="/">
          Back to the overview
        </Link>
      </div>
    </div>
  );
}
