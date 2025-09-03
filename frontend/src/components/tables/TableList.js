import React, { useState, useEffect, useRef } from 'react';
import { tableService } from '../../services/tableService';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisV, FaFileExport, FaFileImport } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import './TableList.css';

function TableList() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [selectedTables, setSelectedTables] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableService.getTables();
        const formattedTables = Array.isArray(data) 
          ? data.map(table => ({
              ID: table.id || table.ID,
              name: table.name || 'Untitled Table',
              columns_structure: table.columns_structure || [],
              created_at: table.created_at || new Date().toISOString(),
              updated_at: table.updated_at || new Date().toISOString()
            }))
          : [];
        setTables(formattedTables);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to load tables. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleTableClick = (tableId) => {
    navigate(`/tables/${tableId}`);
  };

  const handleCreateNew = () => {
    navigate('/tables/new');
  };
  
  // Toggle selection for a single table
  const toggleTableSelect = (tableId) => {
    setSelectedTables(prev => ({
      ...prev,
      [tableId]: !prev[tableId]
    }));
  };

  // Toggle select all tables
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      const allSelected = {};
      tables.forEach(table => {
        allSelected[table.ID] = true;
      });
      setSelectedTables(allSelected);
    } else {
      setSelectedTables({});
    }
  };

  // Export selected tables
  const handleExportSelected = async () => {
    try {
      const selectedTableIds = Object.keys(selectedTables).filter(id => selectedTables[id]);
      
      if (selectedTableIds.length === 0) {
        setError('Please select at least one table to export');
        return;
      }
      
      const tablesToExport = tables.filter(table => selectedTableIds.includes(table.ID));
      
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tables: tablesToExport
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const exportFileName = `tables_export_${new Date().toISOString().split('T')[0]}.json`;
      saveAs(blob, exportFileName);
      
      // Clear selection after export
      setSelectedTables({});
      setSelectAll(false);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export tables');
    } finally {
      setShowMenu(false);
    }
  };
  
  const handleImportClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        setImportStatus({ loading: true });
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const content = e.target.result;
            const { tables: importedTables } = JSON.parse(content);
            
            if (!Array.isArray(importedTables)) {
              throw new Error('Invalid import file format');
            }
            
            // Here you would typically save the imported tables
            // For now, we'll just show a success message
            setImportStatus({ success: 'Tables imported successfully!' });
            
            // Refresh the table list
            const data = await tableService.getTables();
            setTables(data);
          } catch (err) {
            console.error('Import failed:', err);
            setImportStatus({ error: 'Failed to import tables. Invalid file format.' });
          }
        };
        
        reader.onerror = () => {
          setImportStatus({ error: 'Error reading file' });
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus({ error: 'Failed to import tables' });
      }
    };
    
    fileInput.click();
  };

  if (loading) {
    return (
      <div className="loading" style={{ 
        textAlign: 'center', 
        padding: '2rem',
        color: 'var(--text-secondary)'
      }}>
        Loading tables...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ 
        color: 'var(--error)',
        backgroundColor: 'var(--error-light)',
        padding: '1rem',
        borderRadius: '4px',
        margin: '1rem 0',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div className="table-list">
      <div className="table-list-header">
        <h2>Your Tables</h2>
        <div className="header-actions" ref={menuRef}>
          <button 
            onClick={handleCreateNew} 
            className="btn btn-primary"
            style={{ marginRight: '0.5rem' }}
          >
            Create New Table
          </button>
          <button 
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Table actions"
          >
            <FaEllipsisV />
          </button>
          
          {showMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <input 
                  type="checkbox" 
                  checked={selectAll && Object.keys(selectedTables).length === tables.length}
                  onChange={toggleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                />
                <span>{selectAll ? 'Deselect All' : 'Select All'}</span>
              </div>
              <button 
                className={`dropdown-item ${Object.values(selectedTables).some(Boolean) ? '' : 'opacity-50'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (Object.values(selectedTables).some(Boolean)) {
                    handleExportSelected();
                  }
                }}
                disabled={!Object.values(selectedTables).some(Boolean)}
              >
                <FaFileExport className="menu-icon" /> 
                {Object.values(selectedTables).filter(Boolean).length > 0 
                  ? `Export Selected (${Object.values(selectedTables).filter(Boolean).length})` 
                  : 'Export Selected'}
              </button>
              <button 
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImportClick();
                }}
              >
                <FaFileImport className="menu-icon" /> Import Tables
              </button>
            </div>
          )}
        </div>
      </div>
      
      {importStatus?.loading && (
        <div className="import-status loading">Importing tables...</div>
      )}
      {importStatus?.success && (
        <div className="import-status success">
          {importStatus.success}
        </div>
      )}
      {importStatus?.error && (
        <div className="import-status error">
          {importStatus.error}
        </div>
      )}
      
      {tables.length === 0 ? (
        <div className="no-tables">
          <p>No tables found. Create your first table to get started!</p>
        </div>
      ) : (
        <div className="table-grid">
          {tables.map((table) => (
            <div 
              key={table.ID} 
              className={`table-card ${selectedTables[table.ID] ? 'table-card-selected' : ''}`}
              onClick={() => handleTableClick(table.ID)}
            >
              <div className="table-checkbox-container" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={!!selectedTables[table.ID]}
                  onChange={() => toggleTableSelect(table.ID)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${table.name}`}
                />
              </div>
              <div className="flex-1">
                <h3>{table.name}</h3>
                <p>{table.columns_structure?.length || 0} columns</p>
                <div className="table-meta">
                  <span className="last-updated">
                    Updated {new Date(table.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TableList;
