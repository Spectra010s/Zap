import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService } from '../../services/tableService';
import './CreateTable.css';

const DEFAULT_COLUMNS = [
  { name: 'id', type: 'integer' },
  { name: 'name', type: 'string' },
];

const DEFAULT_ROW = ['', ''];

function CreateTable() {
  const navigate = useNavigate();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState([DEFAULT_ROW]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addColumn = () => {
    const newColumnName = `column${columns.length + 1}`;
    setColumns([...columns, { name: newColumnName, type: 'string' }]);
    
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (index) => {
    if (columns.length <= 2) {
      setError('A table must have at least 2 columns');
      return;
    }
    
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
    
    setRows(rows.map(row => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    }));
    
    setError('');
  };

  const addRow = () => {
    setRows([...rows, Array(columns.length).fill('')]);
  };

  const removeRow = (rowIndex) => {
    if (rows.length <= 1) {
      setError('A table must have at least one row');
      return;
    }
    
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
    setError('');
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }
    
    const hasEmptyCells = rows.some(row => 
      row.some((cell, i) => i < 2 && !String(cell).trim())
    );
    
    if (hasEmptyCells) {
      setError('ID and Name columns cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const tableData = {
        name: tableName.trim(),
        data: {
          columns: columns,
          rows: rows.map(row => 
            row.map((cell, i) => {
              if (columns[i].type === 'integer') {
                return isNaN(Number(cell)) ? 0 : Number(cell);
              } else if (columns[i].type === 'number') {
                return isNaN(parseFloat(cell)) ? 0 : parseFloat(cell);
              } else if (columns[i].type === 'boolean') {
                return Boolean(cell);
              }
              return String(cell);
            })
          )
        }
      };
      
      const result = await tableService.createTable(tableData);
      navigate(`/tables/${result.ID || result.id}`);
    } catch (err) {
      console.error('Error creating table:', err);
      setError(err.response?.data?.detail || 'Failed to create table');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-table">
      <h2>Create New Table</h2>
      
      <form onSubmit={handleSubmit} className="table-form">
        <div className="form-group">
          <label htmlFor="tableName">Table Name</label>
          <input
            id="tableName"
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
            required
          />
        </div>
        
        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map((col, colIndex) => (
                    <th key={colIndex}>
                      <div className="column-header">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => updateColumn(colIndex, 'name', e.target.value)}
                          className="column-name"
                          required
                        />
                        <select
                          value={col.type}
                          onChange={(e) => updateColumn(colIndex, 'type', e.target.value)}
                          className="column-type"
                        >
                          <option value="string">Text</option>
                          <option value="integer">Integer</option>
                          <option value="number">Decimal</option>
                          <option value="boolean">True/False</option>
                          <option value="date">Date</option>
                        </select>
                        {columns.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeColumn(colIndex)}
                            className="btn-icon"
                            title="Remove column"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th>
                    <button
                      type="button"
                      onClick={addColumn}
                      className="btn-icon"
                      title="Add column"
                    >
                      + Column
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type={columns[colIndex]?.type === 'boolean' ? 'checkbox' : 'text'}
                          value={cell}
                          onChange={(e) => {
                            const value = columns[colIndex]?.type === 'boolean' 
                              ? e.target.checked 
                              : e.target.value;
                            updateCell(rowIndex, colIndex, value);
                          }}
                          checked={columns[colIndex]?.type === 'boolean' ? Boolean(cell) : undefined}
                          className={columns[colIndex]?.type}
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        className="btn-icon"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="table-actions">
            <button
              type="button"
              onClick={addRow}
              className="btn btn-outline"
            >
              + Add Row
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Table'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTable;
