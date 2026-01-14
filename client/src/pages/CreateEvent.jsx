import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Plus, Trash2, Send, User, Mail, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organizerName: '',
    organizerEmail: '',
  });

  const [proposedDates, setProposedDates] = useState([
    { date: '', startTime: '', endTime: '' }
  ]);

  const [participants, setParticipants] = useState([
    { name: '', email: '' }
  ]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (index, field, value) => {
    const updated = [...proposedDates];
    updated[index][field] = value;
    setProposedDates(updated);
  };

  const addDate = () => {
    setProposedDates([...proposedDates, { date: '', startTime: '', endTime: '' }]);
  };

  const removeDate = (index) => {
    if (proposedDates.length > 1) {
      setProposedDates(proposedDates.filter((_, i) => i !== index));
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', email: '' }]);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title || !formData.organizerName || !formData.organizerEmail) {
      setError('필수 항목을 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    const validDates = proposedDates.filter(d => d.date && d.startTime && d.endTime);
    if (validDates.length === 0) {
      setError('최소 하나의 제안 날짜를 입력해주세요.');
      setLoading(false);
      return;
    }

    const validParticipants = participants.filter(p => p.name && p.email);
    if (validParticipants.length === 0) {
      setError('최소 한 명의 참석자를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/events`, {
        ...formData,
        proposedDates: validDates,
        participants: validParticipants
      });

      if (response.data.success) {
        // Store event data in sessionStorage for success page
        sessionStorage.setItem('createdEvent', JSON.stringify(response.data.event));
        navigate(`/success/${response.data.event.id}`);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('이벤트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-header">
            <h1 className="page-title">새 일정 만들기</h1>
            <p className="page-subtitle">일정 정보를 입력하고 참석자에게 공유하세요</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="card card-elevated" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <FileText className="icon" size={20} />
                기본 정보
              </div>
              
              <div className="form-section">
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="title">이벤트 제목 *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input"
                    placeholder="예: 팀 회의, 프로젝트 미팅"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="description">설명 (선택)</label>
                  <textarea
                    id="description"
                    name="description"
                    className="textarea"
                    placeholder="이벤트에 대한 추가 설명을 입력하세요"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="card card-elevated" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <User className="icon" size={20} />
                주최자 정보
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label htmlFor="organizerName">이름 *</label>
                  <input
                    type="text"
                    id="organizerName"
                    name="organizerName"
                    className="input"
                    placeholder="주최자 이름"
                    value={formData.organizerName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="organizerEmail">이메일 *</label>
                  <input
                    type="email"
                    id="organizerEmail"
                    name="organizerEmail"
                    className="input"
                    placeholder="your@email.com"
                    value={formData.organizerEmail}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Proposed Dates */}
            <div className="card card-elevated" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <Calendar className="icon" size={20} />
                제안 날짜 및 시간
              </div>

              {proposedDates.map((date, index) => (
                <div key={index} className="date-time-row">
                  <div className="input-group">
                    <label>날짜</label>
                    <input
                      type="date"
                      className="input"
                      value={date.date}
                      onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>시작 시간</label>
                    <input
                      type="time"
                      className="input"
                      value={date.startTime}
                      onChange={(e) => handleDateChange(index, 'startTime', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>종료 시간</label>
                    <input
                      type="time"
                      className="input"
                      value={date.endTime}
                      onChange={(e) => handleDateChange(index, 'endTime', e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => removeDate(index)}
                    disabled={proposedDates.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary" onClick={addDate}>
                <Plus size={18} />
                날짜 추가
              </button>
            </div>

            {/* Participants */}
            <div className="card card-elevated" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <Users className="icon" size={20} />
                참석자
              </div>

              {participants.map((participant, index) => (
                <div key={index} className="participant-row">
                  <div className="input-group">
                    <label>이름</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="참석자 이름"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>이메일</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="participant@email.com"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-ghost"
                    onClick={() => removeParticipant(index)}
                    disabled={participants.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary" onClick={addParticipant}>
                <Plus size={18} />
                참석자 추가
              </button>
            </div>

            {error && (
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--error)',
                marginBottom: '1.5rem'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                  생성 중...
                </>
              ) : (
                <>
                  <Send size={20} />
                  이벤트 생성하기
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}

export default CreateEvent;
