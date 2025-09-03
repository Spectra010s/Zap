import React, { useState, useRef } from 'react';
import { FaFileExport, FaFileImport, FaFileCsv, FaFileCode, FaTimes, FaCheck } from 'react-icons/fa';
import { exportTableToJson, exportTableToCsv, importTable } from '../../services/tableExportImport';
import './TableExportImport.css';

const TableExportImport = ({ tableData, onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importStatus, setImportStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  const [selectedFormat, setSelectedFormat] = useState('json');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      if (selectedFormat === 'json') {
        exportTableToJson(tableData);
      } else {
        exportTableToCsv(tableData);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus({
        loading: false,
        success: false,
        error: error.message || 'Failed to export table'
      });
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({
      loading: true,
      success: false,
      error: null
    });

    try {
      const importedData = await importTable(file);
      setImportStatus({
        loading: false,
        success: true,
        error: null
      });
      
      setTimeout(() => {
        onImport(importedData);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus({
        loading: false,
        success: false,
        error: error.message || 'Failed to import table'
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderExportTab = () => (
    <div className="export-tab">
      <h3>Export Table</h3>
      <div className="format-options">
        <div className="format-option">
          <input
            type="radio"
            id="format-json"
            name="export-format"
            value="json"
            checked={selectedFormat === 'json'}
            onChange={() => setSelectedFormat('json')}
          />
          <label htmlFor="format-json">
            <FaFileCode className="format-icon" />
            <div>
              <div className="format-name">JSON</div>
              <div className="format-description">Best for full fidelity and future imports</div>
            </div>
          </label>
        </div>
        
        <div className="format-option">
          <input
            type="radio"
            id="format-csv"
            name="export-format"
            value="csv"
            checked={selectedFormat === 'csv'}
            onChange={() => setSelectedFormat('csv')}
          />
          <label htmlFor="format-csv">
            <FaFileCsv className="format-icon" />
            <div>
              <div className="format-name">CSV</div>
              <div className="format-description">Compatible with spreadsheet software</div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="export-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleExport}>
          <FaFileExport className="btn-icon" />
          Export Table
        </button>
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div className="import-tab">
      <h3>Import Table</h3>
      
      {importStatus.success ? (
        <div className="import-success">
          <div className="success-icon">
            <FaCheck />
          </div>
          <p>Table imported successfully!</p>
        </div>
      ) : (
        <>
          <p>Select a JSON or CSV file to import as a new table.</p>
          
          <div className="file-drop-zone" onClick={triggerFileInput}>
            <FaFileImport className="import-icon" />
            <p>Click to select a file or drag it here</p>
            <p className="file-types">Supported formats: .json, .csv</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.csv"
              style={{ display: 'none' }}
            />
          </div>
          
          {importStatus.loading && (
            <div className="import-loading">
              <div className="spinner"></div>
              <p>Importing table data...</p>
            </div>
          )}
          
          {importStatus.error && (
            <div className="import-error">
              <p>{importStatus.error}</p>
            </div>
          )}
          
          <div className="import-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={importStatus.loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={triggerFileInput}
              disabled={importStatus.loading}
            >
              <FaFileImport className="btn-icon" />
              Select File
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="table-export-import">
      <div className="modal-header">
        <h2>
          {activeTab === 'export' ? 'Export Table' : 'Import Table'}
        </h2>
        <button className="close-button" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <FaFileExport className="tab-icon" />
          Export
        </button>
        <button 
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <FaFileImport className="tab-icon" />
          Import
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'export' ? renderExportTab() : renderImportTab()}
      </div>
    </div>
  );
};

export default TableExportImport;
