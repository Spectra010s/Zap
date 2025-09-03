import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tableService } from '../../services/tableService';
import './EditTable.css';

const EditTable = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  
  const [table, setTable] = useState({
    name: '',
    data: {
      columns: [],
      rows: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTable(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...table.data.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setTable(prev => ({
      ...prev,
      data: {
        ...prev.data,
        columns: newColumns
      }
    }));
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...table.data.rows];
    if (!newRows[rowIndex]) newRows[rowIndex] = [];
    newRows[rowIndex][colIndex] = value;
    
    setTable(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: newRows
      }
    }));
  };

  const addColumn = () => {
    const newColumnName = `column${table.data.columns.length + 1}`;
    const newColumns = [...table.data.columns, { name: newColumnName, type: 'string' }];
    
    const newRows = table.data.rows.map(row => [...(row || []), '']);
    
    setTable(prev => ({
      ...prev,
      data: {
        columns: newColumns,
        rows: newRows.length ? newRows : [[]]
      }
    }));
  };

  const removeColumn = (index) => {
    if (table.data.columns.length <= 2) {
      setError('A table must have at least 2 columns');
      return;
    }
    
    const newColumns = [...table.data.columns];
    newColumns.splice(index, 1);
    
    const newRows = table.data.rows.map(row => {
      const newRow = [...row];
      newRow.splice(index, 1);
      return newRow;
    });
    
    setTable(prev => ({
      ...prev,
      data: {
        columns: newColumns,
        rows: newRows
      }
    }));
    
    setError('');
  };

  const addRow = () => {
    const newRow = new Array(table.data.columns.length).fill('');
    setTable(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: [...prev.data.rows, newRow]
      }
    }));
  };

  const removeRow = (index) => {
    if (table.data.rows.length <= 1) {
      setError('A table must have at least one row');
      return;
    }
    
    const newRows = [...table.data.rows];
    newRows.splice(index, 1);
    
    setTable(prev => ({
      ...prev,
      data: {
        ...prev.data,
        rows: newRows
      }
    }));
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!table.name.trim()) {
      setError('Table name is required');
      return;
    }
    
    if (table.data.columns.length < 2) {
      setError('A table must have at least 2 columns');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await tableService.updateTable(tableId, table);
      navigate(`/tables/${tableId}`);
    } catch (err) {
      console.error('Error updating table:', err);
      setError(err.response?.data?.detail || 'Failed to update table');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading table...</div>;
  }

  return (
    <div className="edit-table">
      <h2>Edit Table: {table.name}</h2>
      
      <form onSubmit={handleSubmit} className="table-form">
        <div className="form-group">
          <label htmlFor="tableName">Table Name</label>
          <input
            id="tableName"
            type="text"
            name="name"
            value={table.name}
            onChange={handleInputChange}
            placeholder="Enter table name"
            required
            className="form-control"
          />
        </div>
        
        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {table.data.columns.map((col, colIndex) => (
                    <th key={colIndex}>
                      <div className="column-header">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => handleColumnChange(colIndex, 'name', e.target.value)}
                          className="column-name"
                          required
                        />
                        <select
                          value={col.type}
                          onChange={(e) => handleColumnChange(colIndex, 'type', e.target.value)}
                          className="column-type"
                        >
                          <option value="string">Text</option>
                          <option value="integer">Integer</option>
                          <option value="number">Decimal</option>
                          <option value="boolean">True/False</option>
                          <option value="date">Date</option>
                        </select>
                        {table.data.columns.length > 2 && (
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
                {table.data.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {table.data.columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type={col.type === 'boolean' ? 'checkbox' : 'text'}
                          value={row[colIndex] || ''}
                          onChange={(e) => {
                            const value = col.type === 'boolean' 
                              ? e.target.checked 
                              : e.target.value;
                            handleCellChange(rowIndex, colIndex, value);
                          }}
                          checked={col.type === 'boolean' ? Boolean(row[colIndex]) : undefined}
                          className={col.type}
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
                <tr>
                  <td colSpan={table.data.columns.length + 1}>
                    <button
                      type="button"
                      onClick={addRow}
                      className="btn btn-outline"
                    >
                      + Add Row
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTable;
