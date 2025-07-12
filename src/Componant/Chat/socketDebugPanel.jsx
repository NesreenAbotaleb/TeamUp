import React, { useState, useEffect } from 'react';
import { socketHandlers } from '../../servies/Chat/socketHandlers';

const SocketDebugPanel = ({ teamId }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const [socketEvents, setSocketEvents] = useState([]);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    // Update debug info every second
    const interval = setInterval(() => {
      setDebugInfo(socketHandlers.getConnectionInfo());
    }, 1000);

    // Listen to all socket events for debugging
    const socket = socketHandlers.getSocket();
    if (socket) {
      const originalEmit = socket.emit;
      const originalOn = socket.on;

      // Override emit to log outgoing events
      socket.emit = function(event, ...args) {
        setSocketEvents(prev => [...prev.slice(-19), {
          type: 'OUTGOING',
          event,
          data: args,
          timestamp: new Date().toLocaleTimeString()
        }]);
        return originalEmit.apply(this, [event, ...args]);
      };

      // Log all incoming events
      const eventTypes = ['new-message', 'message-updated', 'message-deleted', 'connect', 'disconnect', 'connect_error'];
      
      eventTypes.forEach(eventType => {
        socket.on(eventType, (data) => {
          setSocketEvents(prev => [...prev.slice(-19), {
            type: 'INCOMING',
            event: eventType,
            data,
            timestamp: new Date().toLocaleTimeString()
          }]);
        });
      });
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  const sendTestMessage = () => {
    if (!testMessage.trim()) return;
    
    socketHandlers.sendMessage(teamId, {
      content: testMessage,
      type: 'text',
      sender: 'debug-user'
    }, (response) => {
      console.log('Test message response:', response);
    });
    
    setTestMessage('');
  };

  const clearEvents = () => {
    setSocketEvents([]);
  };

  const testConnection = async () => {
    try {
      const result = await socketHandlers.testConnection();
      alert('Connection test successful: ' + JSON.stringify(result));
    } catch (error) {
      alert('Connection test failed: ' + error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 10000,
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>Socket Debug Panel</h3>
      
      {/* Connection Info */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Connection Status:</h4>
        <div>Connected: <span style={{ color: debugInfo.connected ? '#4CAF50' : '#f44336' }}>
          {debugInfo.connected ? '✅ YES' : '❌ NO'}
        </span></div>
        <div>Socket ID: {debugInfo.socketId || 'N/A'}</div>
        <div>Current Room: {debugInfo.currentRoom || 'None'}</div>
        <div>Transport: {debugInfo.transport || 'N/A'}</div>
        <div>Attempts: {debugInfo.connectionAttempts}</div>
      </div>

      {/* Test Controls */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Test Controls:</h4>
        <button onClick={testConnection} style={{ marginRight: '5px', padding: '4px 8px', fontSize: '11px' }}>
          Test Connection
        </button>
        <button onClick={() => socketHandlers.reconnect()} style={{ marginRight: '5px', padding: '4px 8px', fontSize: '11px' }}>
          Reconnect
        </button>
        <button onClick={() => socketHandlers.joinTeamChat(teamId)} style={{ padding: '4px 8px', fontSize: '11px' }}>
          Rejoin Team
        </button>
        
        <div style={{ marginTop: '8px' }}>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test message"
            style={{ width: '200px', padding: '2px 4px', fontSize: '11px' }}
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button onClick={sendTestMessage} style={{ marginLeft: '5px', padding: '4px 8px', fontSize: '11px' }}>
            Send Test
          </button>
        </div>
      </div>

      {/* Socket Events Log */}
      <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0 }}>Socket Events:</h4>
          <button onClick={clearEvents} style={{ padding: '2px 6px', fontSize: '10px' }}>Clear</button>
        </div>
        
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          {socketEvents.length === 0 ? (
            <div style={{ color: '#999', fontStyle: 'italic' }}>No events captured yet...</div>
          ) : (
            socketEvents.map((event, index) => (
              <div key={index} style={{ 
                marginBottom: '4px', 
                padding: '4px', 
                background: event.type === 'INCOMING' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                borderRadius: '2px',
                fontSize: '10px'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {event.timestamp} - {event.type} - {event.event}
                </div>
                <div style={{ color: '#ddd', wordBreak: 'break-all' }}>
                  {JSON.stringify(event.data, null, 1).substring(0, 200)}
                  {JSON.stringify(event.data).length > 200 && '...'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocketDebugPanel;