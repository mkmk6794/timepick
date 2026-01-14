const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://timepick.ai', 'https://www.timepick.ai', process.env.FRONTEND_URL].filter(Boolean)
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ events: [], responses: [] }, null, 2));
  }
}

function readData() {
  initializeData();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create new event
app.post('/api/events', (req, res) => {
  try {
    const { title, description, organizerName, organizerEmail, proposedDates, participants } = req.body;
    
    const eventId = uuidv4();
    const organizerToken = uuidv4();
    
    const participantsWithTokens = participants.map(p => ({
      ...p,
      id: uuidv4(),
      responseToken: uuidv4(),
      hasResponded: false
    }));
    
    const event = {
      id: eventId,
      title,
      description,
      organizerName,
      organizerEmail,
      organizerToken,
      proposedDates: proposedDates.map(d => ({
        ...d,
        id: uuidv4()
      })),
      participants: participantsWithTokens,
      status: 'pending',
      confirmedDate: null,
      createdAt: new Date().toISOString()
    };
    
    const data = readData();
    data.events.push(event);
    writeData(data);
    
    res.status(201).json({
      success: true,
      event: {
        id: eventId,
        organizerToken,
        participants: participantsWithTokens.map(p => ({
          name: p.name,
          email: p.email,
          responseToken: p.responseToken,
          responseLink: `${req.protocol}://${req.get('host')}/respond/${p.responseToken}`
        }))
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
});

// Get event by organizer token (for dashboard)
app.get('/api/events/organizer/:token', (req, res) => {
  try {
    const { token } = req.params;
    const data = readData();
    
    const event = data.events.find(e => e.organizerToken === token);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    // Get responses for this event
    const responses = data.responses.filter(r => r.eventId === event.id);
    
    // Calculate availability for each proposed date
    const availabilityByDate = event.proposedDates.map(date => {
      const availableParticipants = responses
        .filter(r => r.selectedDates.includes(date.id))
        .map(r => {
          const participant = event.participants.find(p => p.id === r.participantId);
          return participant ? participant.name : 'Unknown';
        });
      
      return {
        ...date,
        availableCount: availableParticipants.length,
        availableParticipants,
        percentage: event.participants.length > 0 
          ? Math.round((availableParticipants.length / event.participants.length) * 100)
          : 0
      };
    });
    
    // Update participants with response status
    const participantsWithStatus = event.participants.map(p => {
      const response = responses.find(r => r.participantId === p.id);
      return {
        ...p,
        hasResponded: !!response,
        selectedDates: response ? response.selectedDates : []
      };
    });
    
    const responseRate = event.participants.length > 0
      ? Math.round((responses.length / event.participants.length) * 100)
      : 0;
    
    res.json({
      success: true,
      event: {
        ...event,
        participants: participantsWithStatus,
        availabilityByDate,
        responseRate,
        totalResponses: responses.length
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
});

// Get event for participant response
app.get('/api/events/respond/:token', (req, res) => {
  try {
    const { token } = req.params;
    const data = readData();
    
    let targetEvent = null;
    let targetParticipant = null;
    
    for (const event of data.events) {
      const participant = event.participants.find(p => p.responseToken === token);
      if (participant) {
        targetEvent = event;
        targetParticipant = participant;
        break;
      }
    }
    
    if (!targetEvent || !targetParticipant) {
      return res.status(404).json({ success: false, error: 'Invalid response link' });
    }
    
    // Check if already responded
    const existingResponse = data.responses.find(
      r => r.eventId === targetEvent.id && r.participantId === targetParticipant.id
    );
    
    res.json({
      success: true,
      event: {
        id: targetEvent.id,
        title: targetEvent.title,
        description: targetEvent.description,
        organizerName: targetEvent.organizerName,
        proposedDates: targetEvent.proposedDates,
        status: targetEvent.status,
        confirmedDate: targetEvent.confirmedDate
      },
      participant: {
        id: targetParticipant.id,
        name: targetParticipant.name,
        email: targetParticipant.email
      },
      existingResponse: existingResponse ? existingResponse.selectedDates : null
    });
  } catch (error) {
    console.error('Error fetching event for response:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
});

// Submit participant response
app.post('/api/responses', (req, res) => {
  try {
    const { responseToken, selectedDates } = req.body;
    const data = readData();
    
    let targetEvent = null;
    let targetParticipant = null;
    
    for (const event of data.events) {
      const participant = event.participants.find(p => p.responseToken === responseToken);
      if (participant) {
        targetEvent = event;
        targetParticipant = participant;
        break;
      }
    }
    
    if (!targetEvent || !targetParticipant) {
      return res.status(404).json({ success: false, error: 'Invalid response token' });
    }
    
    // Remove existing response if any
    data.responses = data.responses.filter(
      r => !(r.eventId === targetEvent.id && r.participantId === targetParticipant.id)
    );
    
    // Add new response
    const response = {
      id: uuidv4(),
      eventId: targetEvent.id,
      participantId: targetParticipant.id,
      selectedDates,
      submittedAt: new Date().toISOString()
    };
    
    data.responses.push(response);
    
    // Update participant status
    const eventIndex = data.events.findIndex(e => e.id === targetEvent.id);
    const participantIndex = data.events[eventIndex].participants.findIndex(
      p => p.id === targetParticipant.id
    );
    data.events[eventIndex].participants[participantIndex].hasResponded = true;
    
    writeData(data);
    
    res.json({ success: true, message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ success: false, error: 'Failed to submit response' });
  }
});

// Confirm event date
app.post('/api/events/:eventId/confirm', (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizerToken, confirmedDateId, message } = req.body;
    const data = readData();
    
    const eventIndex = data.events.findIndex(
      e => e.id === eventId && e.organizerToken === organizerToken
    );
    
    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Event not found or unauthorized' });
    }
    
    const confirmedDate = data.events[eventIndex].proposedDates.find(d => d.id === confirmedDateId);
    if (!confirmedDate) {
      return res.status(400).json({ success: false, error: 'Invalid date selection' });
    }
    
    data.events[eventIndex].status = 'confirmed';
    data.events[eventIndex].confirmedDate = confirmedDate;
    data.events[eventIndex].confirmationMessage = message;
    data.events[eventIndex].confirmedAt = new Date().toISOString();
    
    writeData(data);
    
    // Generate confirmation messages
    const event = data.events[eventIndex];
    const emailMessage = generateEmailMessage(event);
    const smsMessage = generateSmsMessage(event);
    
    res.json({
      success: true,
      event: data.events[eventIndex],
      messages: {
        email: emailMessage,
        sms: smsMessage
      }
    });
  } catch (error) {
    console.error('Error confirming event:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm event' });
  }
});

// Helper functions for message generation
function generateEmailMessage(event) {
  const date = event.confirmedDate;
  return {
    subject: `[확정] ${event.title} 일정 안내`,
    body: `안녕하세요,

${event.organizerName}님이 주최하는 "${event.title}" 일정이 확정되었습니다.

📅 확정 일시
날짜: ${date.date}
시간: ${date.startTime} ~ ${date.endTime}

📝 상세 내용
${event.description || '추가 설명 없음'}

${event.confirmationMessage ? `\n💬 주최자 메시지\n${event.confirmationMessage}` : ''}

참석 부탁드립니다.

감사합니다.
${event.organizerName} 드림

---
TimePick으로 생성된 일정 안내입니다.`
  };
}

function generateSmsMessage(event) {
  const date = event.confirmedDate;
  return `[${event.title}] 일정 확정 안내
📅 ${date.date} ${date.startTime}~${date.endTime}
주최: ${event.organizerName}`;
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Express 5 compatible catch-all route
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`TimePick server running on port ${PORT}`);
});
