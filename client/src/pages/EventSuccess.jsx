import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Copy, Mail, ExternalLink, LayoutDashboard } from 'lucide-react';

function EventSuccess() {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('createdEvent');
    if (stored) {
      setEventData(JSON.parse(stored));
    }
  }, []);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openMailClient = (participant) => {
    const subject = encodeURIComponent(`일정 조율 요청: ${eventData?.title || '새 이벤트'}`);
    const body = encodeURIComponent(`안녕하세요 ${participant.name}님,

일정 조율을 위해 아래 링크에서 가능한 시간을 선택해주세요.

응답 링크: ${getResponseUrl(participant.responseToken)}

감사합니다.`);
    
    window.location.href = `mailto:${participant.email}?subject=${subject}&body=${body}`;
  };

  const getResponseUrl = (token) => {
    return `${window.location.origin}/respond/${token}`;
  };

  const getDashboardUrl = () => {
    if (!eventData) return '';
    return `${window.location.origin}/dashboard/${eventData.organizerToken}`;
  };

  if (!eventData) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <p>이벤트 정보를 불러올 수 없습니다.</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            새 이벤트 만들기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="success-page"
        >
          <div className="success-icon">
            <Check size={40} />
          </div>

          <h1 style={{ marginBottom: '0.75rem' }}>이벤트가 생성되었습니다!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            아래 링크를 참석자에게 공유하여 응답을 수집하세요.
          </p>

          {/* Dashboard Link */}
          <div className="card card-elevated" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <div className="section-title" style={{ marginBottom: '1rem' }}>
              <LayoutDashboard size={20} className="icon" />
              주최자 대시보드
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              이 링크를 저장해두세요. 응답 현황을 확인하고 일정을 확정할 수 있습니다.
            </p>
            <div className="link-item">
              <span className="link-url" style={{ flex: 1 }}>{getDashboardUrl()}</span>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => copyToClipboard(getDashboardUrl(), 'dashboard')}
              >
                {copiedIndex === 'dashboard' ? <Check size={16} /> : <Copy size={16} />}
                {copiedIndex === 'dashboard' ? '복사됨' : '복사'}
              </button>
              <Link to={`/dashboard/${eventData.organizerToken}`} className="btn btn-sm btn-primary">
                <ExternalLink size={16} />
                열기
              </Link>
            </div>
          </div>

          {/* Participant Links */}
          <div className="card card-elevated" style={{ textAlign: 'left' }}>
            <div className="section-title" style={{ marginBottom: '1rem' }}>
              <Mail size={20} className="icon" />
              참석자 응답 링크
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              각 참석자에게 개인별 링크를 공유하세요.
            </p>

            <div className="link-list">
              {eventData.participants.map((participant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="link-item"
                >
                  <span className="participant-name">{participant.name}</span>
                  <span className="link-url">{getResponseUrl(participant.responseToken)}</span>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => copyToClipboard(getResponseUrl(participant.responseToken), index)}
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => openMailClient(participant)}
                  >
                    <Mail size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to={`/dashboard/${eventData.organizerToken}`} className="btn btn-primary btn-lg">
              <LayoutDashboard size={20} />
              대시보드로 이동
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default EventSuccess;
