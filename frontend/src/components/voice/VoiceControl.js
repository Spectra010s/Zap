import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { FaMicrophone, FaStop, FaSpinner, FaCheck, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { processVoiceCommand } from '../../services/commandService';
import { tableService } from '../../services/tableService';
import './VoiceControl.css';

const API_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:8000';

const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

const VoiceControl = forwardRef(({ disabled = false, className = '', onActivate, style = {} }, ref) => {
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState({ 
    message: '', 
    type: 'info',
    visible: false
  });
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  const createTable = useCallback(async (tableName, columns, rows) => {
    try {
      const tableData = {
        name: tableName,
        data: {
          columns: columns || ['Column 1', 'Column 2'],
          rows: rows || [['', '']]
        }
      };
      
      const result = await tableService.createTable(tableData);
      const successMessage = `Created new table: ${tableName}`;
      speak(successMessage);
      return result;
    } catch (error) {
      console.error('Error creating table:', error);
      const errorMessage = 'Failed to create table. Please try again.';
      speak(errorMessage);
      throw error;
    }
  }, []);

  const processCommand = useCallback(async (input, isAudio = false) => {
    if ((!input || !input.trim()) && !isAudio) return;
    
    setIsProcessing(true);
    setError('');
    setFeedback({ message: 'Processing...', type: 'info', visible: true });
    
    try {
      let commandResult;
      let commandText = input;
      
      if (isAudio) {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          
          const audioFile = new File(
            [audioBlob], 
            'recording.webm', 
            { type: 'audio/webm;codecs=opus' }
          );
          
          const formData = new FormData();
          formData.append('audio', audioFile);
          
          const token = await getAuthToken();
          const response = await fetch(`${API_BASE_URL}/api/v1/voice/transcribe`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to process audio');
          }
          
          const data = await response.json();
          commandText = data.text || '';
          setInputText(commandText);
          
          if (!commandText.trim()) {
            throw new Error('No speech detected. Please try again.');
          }
          
          commandResult = await processVoiceCommand(commandText);
        } catch (error) {
          console.error('Error processing audio:', error);
          setError(error.message || 'Failed to process voice command');
          setFeedback({
            message: error.message || 'Failed to process voice command',
            type: 'error',
            visible: true
          });
          return;
        }
      } else {
        commandResult = await processVoiceCommand(commandText);
      }
      
      switch (commandResult.action) {
        case 'navigate':
          navigate(commandResult.path);
          speak(`Navigating to ${commandResult.pageName}`);
          setFeedback({
            message: `Navigating to ${commandResult.pageName}`,
            type: 'success',
            visible: true
          });
          break;
          
        case 'createTable':
          try {
            await createTable(commandResult.tableName, commandResult.columns, commandResult.rows);
            const successMessage = `Created new table: ${commandResult.tableName}`;
            setFeedback({
              message: successMessage,
              type: 'success',
              visible: true
            });
            navigate('/tables');
          } catch (error) {
            console.error('Error creating table:', error);
            const errorMessage = 'Failed to create table. Please try again.';
            speak(errorMessage);
            setFeedback({
              message: errorMessage,
              type: 'error',
              visible: true
            });
          }
          break;

        case 'aiResponse':
          try {
            const aiResponse = commandResult.message || "I'm not sure how to respond to that.";
            
            speak(aiResponse);
            setFeedback({
              message: aiResponse,
              type: 'info',
              visible: true
            });
          } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage = 'Sorry, I had trouble processing your request.';
            speak(errorMessage);
            setFeedback({
              message: errorMessage,
              type: 'error',
              visible: true
            });
          }
          break;

        default:
          try {
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/v1/voice/transcribe`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                text: input
              })
            });

            if (!response.ok) {
              throw new Error('Failed to process command');
            }

            const data = await response.json();
            const responseText = data.text || 'I received your message but have no response.';
            
            setFeedback({ 
              message: responseText,
              type: 'info',
              visible: true 
            });
            
            speak(responseText);
            setInputText('');
          } catch (err) {
            console.error('Error processing command:', err);
            const errorMsg = err.response?.data?.error || 'Failed to process command. Please try again.';
            setError(errorMsg);
            setFeedback({ 
              message: errorMsg, 
              type: 'error',
              visible: true 
            });
            speak("Sorry, I couldn't process that command.");
          }
      }
    } catch (error) {
      console.error('Error processing command:', error);
      const errorMsg = error.response?.data?.error || 'Failed to process command. Please try again.';
      setError(errorMsg);
      setFeedback({ 
        message: errorMsg, 
        type: 'error',
        visible: true 
      });
      speak("Sorry, I couldn't process that command.");
    } finally {
      setIsProcessing(false);
    }
  }, [getAuthToken, navigate, createTable]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (inputText.trim()) {
      processCommand(inputText);
      setInputText('');
    }
  }, [inputText, processCommand]);

  const handleSendClick = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const stopListening = useCallback(() => {
    try {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      const stream = mediaRecorderRef.current?.stream;
      
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        mediaRecorderRef.current.stream = null;
      }
      
      mediaRecorderRef.current = null;
      
      audioChunksRef.current = [];
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Error stopping recording');
      setFeedback({
        message: 'Error stopping recording',
        type: 'error',
        visible: true
      });
    } finally {
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (onActivate) onActivate();
    try {
      setError('');
      setShowInput(false);
      setFeedback({ message: 'Initializing microphone...', type: 'info', visible: true });
      
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setFeedback({ message: 'Authentication required', type: 'error', visible: true });
        return;
      }
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1  
        } 
      });
      
      audioChunksRef.current = [];
      
      const options = { mimeType };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const currentStream = stream;
        try {
          if (audioChunksRef.current.length === 0) {
            setFeedback({ message: 'No audio recorded', type: 'error', visible: true });
            return;
          }
          
          setFeedback({ message: 'Processing your voice command...', type: 'info', visible: true });
          await processCommand('', true); 
          
        } catch (err) {
          console.error('Error processing audio:', err);
          setError(err.message || 'Failed to process audio');
          setFeedback({ 
            message: err.message || 'Failed to process audio', 
            type: 'error', 
            visible: true 
          });
        } finally {
          try {
            if (currentStream) {
              currentStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
              });
            }
            
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.ondataavailable = null;
              mediaRecorderRef.current.onstop = null;
              mediaRecorderRef.current = null;
            }
            
            audioChunksRef.current = [];
          } catch (cleanupErr) {
            console.error('Error during cleanup:', cleanupErr);
          } finally {
            setIsProcessing(false);
            setIsListening(false);
          }
        }
      };
      
      mediaRecorderRef.current.start(100);
      setIsListening(true);
      setFeedback({ message: 'Listening... Speak now', type: 'info', visible: true });
      
      stopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
          setFeedback({ message: 'No speech detected', type: 'error' });
          setIsListening(false);
        }
      }, 5000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access was denied. Please allow microphone access to use voice commands.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please check your audio settings.');
      } else {
        setError('Error accessing microphone. Please try again.');
      }
      setFeedback({ message: 'Microphone error', type: 'error' });
      setIsListening(false);
    }
  }, [getAuthToken, onActivate, processCommand]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => {
              track.stop();
              track.enabled = false;
            });
          }
          
          mediaRecorderRef.current.ondataavailable = null;
          mediaRecorderRef.current.onstop = null;
        } catch (error) {
          console.error('Error during cleanup:', error);
        } finally {
          mediaRecorderRef.current = null;
        }
      }
      
      audioChunksRef.current = [];
    };
  }, []);

  if (disabled) {
    return null;
  }

  return (  
    <div className={`voice-control ${className}`} ref={ref} style={style}>
      <div className="voice-control-container">
        {showInput && (
          <div className="voice-input-form">
            <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your command..."
                className="voice-text-input"
                disabled={isProcessing}
                autoFocus
                style={{
                  paddingRight: '80px',
                }}
              />
              <button
                type="button"
                className="voice-submit-button"
                onClick={handleSendClick}
                disabled={!inputText.trim() || isProcessing}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        )}

        <div className="voice-buttons">
          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            disabled={disabled || isProcessing || showInput}
            aria-label={isListening ? 'Stop listening' : 'Start voice command'}
            type="button"
          >
            {isProcessing ? (
              <FaSpinner className="icon spin" />
            ) : isListening ? (
              <FaStop className="icon" />
            ) : (
              <FaMicrophone className="icon" />
            )}
          </button>

          <button
            className={`text-toggle-button ${showInput ? 'active' : ''}`}
            onClick={() => setShowInput(!showInput)}
            disabled={disabled || isProcessing || isListening}
            aria-label={showInput ? 'Hide text input' : 'Type command'}
            type="button"
          >
            {showInput ? '🎤' : '⌨️'}
          </button>
        </div>

        {(feedback.visible || isProcessing) && (
          <div className={`voice-feedback ${feedback.type} visible`}>
            <div className="voice-feedback-content">
              <div className="feedback-content">
                {isProcessing ? (
                  <div className="feedback-message">
                    <FaSpinner className="feedback-icon spin" /> Processing...
                  </div>
                ) : feedback.type === 'error' ? (
                  <div className="feedback-message error">
                    <FaTimes className="feedback-icon" /> {feedback.message}
                  </div>
                ) : (
                  <div className="feedback-message">
                    {feedback.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VoiceControl.displayName = 'VoiceControl';

export default VoiceControl;
