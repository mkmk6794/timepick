import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, Send, User, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

function Respond() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    fetchEventData();
  }, [token]);

  const fetchEventData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/respond/${token}`);
      if (response.data.success) {
        setEventData(response.data.event);
        setParticipant(response.data.participant);
        if (response.data.existingResponse) {
          setSelectedDates(response.data.existingResponse);
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('유효하지 않은 링크이거나 이벤트를 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (dateId) => {
    setSelectedDates(prev => 
      prev.includes(dateId)
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    );
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      setError('최소 하나의 날짜를 선택해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/responses`, {
        responseToken: token,
        selectedDates
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      setError('응답 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'M월 d일 (EEEE)', { locale: ko });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          <div className="spinner" />
        </div>
      </main>
    );
  }

  if (error && !eventData) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            color: 'var(--error)'
          }}>
            <AlertCircle size={40} />
          </div>
          <h2 style={{ marginBottom: '1rem' }}>링크 오류</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">
              <CheckCircle size={40} />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>응답이 제출되었습니다!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              주최자가 일정을 확정하면 안내 메시지를 받으실 수 있습니다.
            </p>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>{eventData.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                주최자: {eventData.organizerName}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                선택한 날짜: {selectedDates.length}개
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (eventData.status === 'confirmed') {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">
              <Check size={40} />
            </div>
            <h2 style={{ marginBottom: '1rem' }}>일정이 확정되었습니다!</h2>
            <div className="confirm-box" style={{ marginTop: '2rem' }}>
              <h3>{eventData.title}</h3>
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  📅 {formatDate(eventData.confirmedDate.date)}
                </p>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  ⏰ {eventData.confirmedDate.startTime} ~ {eventData.confirmedDate.endTime}
                </p>
              </div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                주최자: {eventData.organizerName}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-header">
            <h1 className="page-title">{eventData.title}</h1>
            <p className="page-subtitle">
              <User size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
              {eventData.organizerName}님의 일정 초대
            </p>
          </div>

          {eventData.description && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>{eventData.description}</p>
            </div>
          )}

          <div className="card card-elevated">
            <div className="section-title">
              <Calendar className="icon" size={20} />
              안녕하세요, {participant.name}님! 가능한 날짜를 선택해주세요.
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              복수 선택이 가능합니다. 가능한 모든 날짜를 선택해주세요.
            </p>

            <div className="response-grid">
              {eventData.proposedDates.map((date, index) => (
                <motion.div
                  key={date.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`date-option ${selectedDates.includes(date.id) ? 'selected' : ''}`}
                  onClick={() => toggleDate(date.id)}
                >
                  <div className="checkbox">
                    {selectedDates.includes(date.id) && <Check size={16} color="var(--background)" />}
                  </div>
                  <div className="date-info">
                    <h4>{formatDate(date.date)}</h4>
                    <p>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                      {date.startTime} ~ {date.endTime}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {error && (
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--error)',
                marginTop: '1.5rem'
              }}>
                {error}
              </div>
            )}

            <button 
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={handleSubmit}
              disabled={submitting || selectedDates.length === 0}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  제출 중...
                </>
              ) : (
                <>
                  <Send size={20} />
                  응답 제출하기 ({selectedDates.length}개 선택)
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default Respond;
