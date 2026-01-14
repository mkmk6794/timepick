import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Clock size={20} />
            </div>
            <span className="logo-text">TimePick</span>
          </Link>
          <Link to="/create" className="btn btn-primary btn-sm">
            일정 만들기
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
