import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Plus, Trash2, Send, User, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

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

  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  
  // Time range
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const [participants, setParticipants] = useState([
    { name: '', email: '' }
  ]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calendar functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isDateSelected = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDates.includes(dateStr);
  };

  const toggleDate = (day) => {
    if (isDateDisabled(day)) return;
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr].sort());
    }
  };

  const removeDate = (dateStr) => {
    setSelectedDates(selectedDates.filter(d => d !== dateStr));
  };

  const formatDateDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return `${month}월 ${day}일 (${WEEKDAYS[date.getDay()]})`;
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

    if (!formData.title || !formData.organizerName || !formData.organizerEmail) {
      setError('필수 항목을 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    if (selectedDates.length === 0) {
      setError('최소 하나의 날짜를 선택해주세요.');
      setLoading(false);
      return;
    }

    const validParticipants = participants.filter(p => p.name && p.email);
    if (validParticipants.length === 0) {
      setError('최소 한 명의 참석자를 입력해주세요.');
      setLoading(false);
      return;
    }

    // Convert selected dates to proposedDates format
    const proposedDates = selectedDates.map(dateStr => ({
      date: dateStr,
      startTime: startTime,
      endTime: endTime
    }));

    try {
      const response = await axios.post(`${API_URL}/api/events`, {
        ...formData,
        proposedDates,
        participants: validParticipants
      });

      if (response.data.success) {
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

  // Calendar render
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day other-month"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day);
      const isSelected = isDateSelected(day);
      const isToday = day === today.getDate() && 
                      currentMonth === today.getMonth() && 
                      currentYear === today.getFullYear();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => toggleDate(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-header">
            <h1 className="page-title">새 일정 만들기</h1>
            <p className="page-subtitle">일정 정보를 입력하고 참석자에게 공유하세요</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <FileText className="icon" size={20} />
                기본 정보
              </div>
              
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
                  placeholder="이벤트에 대한 추가 설명"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
            </div>

            {/* Organizer Info */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
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

            {/* Calendar Date Selection */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">
                <Calendar className="icon" size={20} />
                후보 날짜 선택
              </div>

              <div className="calendar-container" style={{ border: 'none', padding: 0 }}>
                <div className="calendar-header">
                  <h3>{currentYear}년 {MONTHS[currentMonth]}</h3>
                  <div className="calendar-nav">
                    <button type="button" onClick={prevMonth}>
                      <ChevronLeft size={18} />
                    </button>
                    <button type="button" onClick={nextMonth}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="calendar-weekdays">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                  ))}
                </div>

                <div className="calendar-days">
                  {renderCalendar()}
                </div>

                {selectedDates.length > 0 && (
                  <div className="selected-dates">
                    <div className="selected-dates-label">선택된 날짜 ({selectedDates.length}개)</div>
                    {selectedDates.map(dateStr => (
                      <div key={dateStr} className="selected-date-tag">
                        {formatDateDisplay(dateStr)}
                        <button type="button" onClick={() => removeDate(dateStr)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Range */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', display: 'block' }}>
                  시간 범위
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="time"
                    className="input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>~</span>
                  <input
                    type="time"
                    className="input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
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
                    className="btn btn-ghost btn-sm"
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
                background: 'rgba(214, 48, 49, 0.1)', 
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
