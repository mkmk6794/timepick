import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventSuccess from './pages/EventSuccess';
import Respond from './pages/Respond';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/success/:eventId" element={<EventSuccess />} />
        <Route path="/respond/:token" element={<Respond />} />
        <Route path="/dashboard/:token" element={<Dashboard />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
