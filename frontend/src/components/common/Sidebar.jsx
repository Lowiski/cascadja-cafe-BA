import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { logout } from '../../services/authService.js';

// Left navigation extracted from the original Layout component.
export default function Sidebar({ nav = [], open = false, onClose = () => {} }) {
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <Link to="/" className="brand" aria-label="Cascadja Foods and Drinks home" onClick={onClose}>
        <span className="brand__mark">
          <img src="/logo.png" alt="" width="26" height="26" />
        </span>
        <span className="brand__text">
          <strong>Cascadja</strong>
          <small>Foods &amp; Drinks</small>
        </span>
      </Link>

      <div className="sidebar__tagline">
        <span>Business analytics</span>
        <span className="line" />
        <span>Capstone</span>
      </div>

      <nav className="nav">
        {nav.map((section) => (
          <div key={section.group} className="nav__group">
            <p className="nav__label">{section.group}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                onClick={onClose}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <div className="sidebar__foot-card">
          <Icon name="spark" size={18} />
          <p>
            <strong>5 variables + channel</strong>
            <span>Date/daypart · Category · Price · Quantity · Sales · Channel</span>
          </p>
        </div>
        <p className="sidebar__credit">Admin access · saved to Neon Postgres</p>
        <button className="sidebar__logout" type="button" onClick={signOut}>
          <Icon name="logout" size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
