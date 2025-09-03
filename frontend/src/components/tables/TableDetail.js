import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tableService } from '../../services/tableService';
import './TableDetail.css';

function TableDetail() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const data = await tableService.getTable(tableId);
        setTable(data);
      } catch (err) {
        setError('Failed to load table');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTable();
  }, [tableId]);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    try {
      const result = await tableService.compilePrompt(tableId, prompt);
      
      if (result.success === false || 
          (result.answer_sentence && 
           (result.answer_sentence.includes('did not understand') || 
            result.answer_sentence.includes('Unfortunately')))) {
        throw new Error(result.answer_sentence || 'Failed to process your request');
      }

      setResponse(prev => `${prev ? prev + '\n\n' : ''}You: ${prompt}\nAI: ${result.answer_sentence || 'Command processed successfully'}`);
      setPrompt('');
      
      if (result.queries && result.queries.length > 0) {
        const updatedTable = await tableService.getTable(tableId);
        setTable(updatedTable);
      }
    } catch (err) {
      setResponse(prev => `${prev ? prev + '\n\n' : ''}You: ${prompt}\nError: ${err.message || 'Failed to process your request'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      try {
        await tableService.deleteTable(tableId);
        navigate('/tables');
      } catch (err) {
        setError('Failed to delete table');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading table...</div>;
  }

  if (error || !table) {
    return <div className="error">{error || 'Table not found'}</div>;
  }

  const formatCellValue = (value, type) => {
    if (value === null || value === undefined) return '';
    if (type === 'boolean') return value ? '✓' : '✗';
    if (type === 'date') return new Date(value).toLocaleDateString();
    return String(value);
  };

  return (
    <div className="table-detail">
      <div className="table-header">
        <div>
          <h2>{table.name}</h2>
          <p className="table-meta">
            {table.data?.rows?.length || 0} rows • {table.data?.columns?.length || 0} columns
          </p>
        </div>
        <div className="table-actions">
          <button 
            onClick={() => navigate(`/tables/${tableId}/edit`)}
            className="btn btn-outline"
          >
            Edit Table
          </button>
          <button 
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete Table
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {table.data?.columns?.map((col, index) => (
                <th key={index}>{col.name} ({col.type})</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.data?.rows?.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const columnType = table.data?.columns?.[cellIndex]?.type || 'string';
                  return (
                    <td key={cellIndex} className={`cell-${columnType}`}>
                      {formatCellValue(cell, columnType)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!table.data?.rows?.length && (
              <tr>
                <td colSpan={table.data?.columns?.length || 1} className="no-data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="chat-interface">
        <h3>Ask about this table</h3>
        <div className="chat-messages">
          <pre>{response || 'Ask a question about this table...'}</pre>
        </div>
        <form onSubmit={handlePromptSubmit} className="prompt-form">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question here..."
            disabled={isProcessing}
          />
          <button type="submit" disabled={isProcessing || !prompt.trim()}>
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TableDetail;
