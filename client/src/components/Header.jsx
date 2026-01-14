import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Clock size={24} />
          </div>
          <span className="logo-text">TimePick</span>
        </Link>
        <Link to="/create" className="btn btn-primary btn-sm">
          일정 만들기
        </Link>
      </div>
    </header>
  );
}

export default Header;
