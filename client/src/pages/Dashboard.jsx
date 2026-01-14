import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Users, Check, CheckCircle, 
  AlertCircle, Copy, Mail, MessageSquare, Send,
  RefreshCw, User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

function Dashboard() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [eventData, setEventData] = useState(null);
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    fetchEventData();
  }, [token]);

  const fetchEventData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events/organizer/${token}`);
      if (response.data.success) {
        setEventData(response.data.event);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('이벤트를 찾을 수 없거나 접근 권한이 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDateId) return;
    
    setConfirming(true);
    try {
      const response = await axios.post(`${API_URL}/api/events/${eventData.id}/confirm`, {
        organizerToken: token,
        confirmedDateId: selectedDateId,
        message: confirmMessage
      });

      if (response.data.success) {
        setConfirmationResult(response.data.messages);
        setEventData(response.data.event);
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error('Error confirming event:', err);
      setError('일정 확정 중 오류가 발생했습니다.');
    } finally {
      setConfirming(false);
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

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
          <h2 style={{ marginBottom: '1rem' }}>접근 오류</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{eventData.title}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {eventData.status === 'confirmed' ? (
                  <span style={{ color: 'var(--accent)' }}>
                    <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                    일정 확정됨
                  </span>
                ) : (
                  '응답 수집 중'
                )}
              </p>
            </div>
            <button className="btn btn-secondary" onClick={fetchEventData}>
              <RefreshCw size={18} />
              새로고침
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{eventData.totalResponses}</div>
              <div className="stat-label">응답 완료</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventData.participants.length}</div>
              <div className="stat-label">총 참석자</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventData.responseRate}%</div>
              <div className="stat-label">응답률</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventData.proposedDates.length}</div>
              <div className="stat-label">제안 날짜</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>응답 진행률</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{eventData.totalResponses}/{eventData.participants.length}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${eventData.responseRate}%` }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              일정별 현황
            </button>
            <button 
              className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              참석자 현황
            </button>
            {confirmationResult && (
              <button 
                className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                확정 메시지
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="card card-elevated">
              <div className="section-title">
                <Calendar className="icon" size={20} />
                제안 날짜별 참석 가능 현황
              </div>

              {eventData.status === 'confirmed' ? (
                <div className="confirm-box" style={{ marginBottom: '1.5rem' }}>
                  <h3>확정된 일정</h3>
                  <p style={{ fontSize: '1.25rem', marginTop: '1rem' }}>
                    📅 {formatDate(eventData.confirmedDate.date)}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    ⏰ {eventData.confirmedDate.startTime} ~ {eventData.confirmedDate.endTime}
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  가장 많은 참석자가 가능한 날짜를 선택하여 일정을 확정하세요.
                </p>
              )}

              <table className="availability-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>시간</th>
                    <th>가능 인원</th>
                    <th>참석 가능자</th>
                    {eventData.status !== 'confirmed' && <th>선택</th>}
                  </tr>
                </thead>
                <tbody>
                  {eventData.availabilityByDate
                    .sort((a, b) => b.availableCount - a.availableCount)
                    .map((date, index) => (
                    <tr key={date.id}>
                      <td style={{ fontWeight: '500' }}>{formatDate(date.date)}</td>
                      <td>{date.startTime} ~ {date.endTime}</td>
                      <td>
                        <span style={{ 
                          fontWeight: '600',
                          color: date.percentage === 100 ? 'var(--accent)' : 
                                 date.percentage >= 50 ? 'var(--primary)' : 'var(--text-secondary)'
                        }}>
                          {date.availableCount}/{eventData.participants.length}
                        </span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                          ({date.percentage}%)
                        </span>
                      </td>
                      <td>
                        {date.availableParticipants.length > 0 ? (
                          date.availableParticipants.map((name, i) => (
                            <span key={i} className="participant-badge">
                              <User size={12} />
                              {name}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      {eventData.status !== 'confirmed' && (
                        <td>
                          <button 
                            className={`btn btn-sm ${selectedDateId === date.id ? 'btn-accent' : 'btn-secondary'}`}
                            onClick={() => {
                              setSelectedDateId(date.id);
                              setShowConfirmModal(true);
                            }}
                          >
                            <Check size={16} />
                            선택
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="card card-elevated">
              <div className="section-title">
                <Users className="icon" size={20} />
                참석자별 응답 현황
              </div>

              <table className="availability-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>상태</th>
                    <th>선택한 날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {eventData.participants.map((participant, index) => (
                    <tr key={participant.id}>
                      <td style={{ fontWeight: '500' }}>{participant.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{participant.email}</td>
                      <td>
                        {participant.hasResponded ? (
                          <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={16} />
                            응답 완료
                          </span>
                        ) : (
                          <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={16} />
                            대기 중
                          </span>
                        )}
                      </td>
                      <td>
                        {participant.hasResponded && participant.selectedDates ? (
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {participant.selectedDates.length}개 날짜 선택
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'messages' && confirmationResult && (
            <div className="card card-elevated">
              <div className="section-title">
                <MessageSquare className="icon" size={20} />
                확정 메시지
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                아래 메시지를 복사하여 참석자에게 공유하세요.
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4>
                    <Mail size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    이메일 메시지
                  </h4>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(
                      `제목: ${confirmationResult.email.subject}\n\n${confirmationResult.email.body}`,
                      'email'
                    )}
                  >
                    {copiedText === 'email' ? <Check size={16} /> : <Copy size={16} />}
                    {copiedText === 'email' ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="message-preview">
                  <strong>제목: {confirmationResult.email.subject}</strong>
                  {'\n\n'}
                  {confirmationResult.email.body}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4>
                    <MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    문자 메시지
                  </h4>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => copyToClipboard(confirmationResult.sms, 'sms')}
                  >
                    {copiedText === 'sms' ? <Check size={16} /> : <Copy size={16} />}
                    {copiedText === 'sms' ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="message-preview">
                  {confirmationResult.sms}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Modal */}
          {showConfirmModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card card-elevated"
                style={{ maxWidth: '500px', width: '100%' }}
              >
                <h3 style={{ marginBottom: '1.5rem' }}>일정 확정하기</h3>
                
                {selectedDateId && (
                  <div className="confirm-box" style={{ marginBottom: '1.5rem' }}>
                    {eventData.availabilityByDate
                      .filter(d => d.id === selectedDateId)
                      .map(date => (
                        <div key={date.id}>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            📅 {formatDate(date.date)}
                          </p>
                          <p style={{ color: 'var(--text-secondary)' }}>
                            ⏰ {date.startTime} ~ {date.endTime}
                          </p>
                          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                            가능 인원: {date.availableCount}/{eventData.participants.length}명
                          </p>
                        </div>
                      ))
                    }
                  </div>
                )}

                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label>추가 메시지 (선택)</label>
                  <textarea
                    className="textarea"
                    placeholder="참석자에게 전달할 추가 메시지를 입력하세요"
                    value={confirmMessage}
                    onChange={(e) => setConfirmMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowConfirmModal(false)}
                  >
                    취소
                  </button>
                  <button 
                    className="btn btn-accent"
                    style={{ flex: 1 }}
                    onClick={handleConfirm}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                        확정 중...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        확정하기
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default Dashboard;
