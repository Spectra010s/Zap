import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

/**
 * Export table data to a JSON file
 * @param {Object} tableData 
 * @param {string} [fileName] 
 */
export const exportTableToJson = (tableData, fileName = null) => {
  try {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      table: {
        id: tableData.id || uuidv4(),
        name: tableData.name || 'Untitled Table',
        description: tableData.description || '',
        columns: tableData.columns || [],
        rows: tableData.rows || [],
        createdAt: tableData.createdAt || new Date().toISOString(),
        updatedAt: tableData.updatedAt || new Date().toISOString(),
        metadata: tableData.metadata || {}
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const exportFileName = fileName || `table_${tableData.name || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    
    saveAs(blob, exportFileName);
    return true;
  } catch (error) {
    console.error('Error exporting table:', error);
    throw new Error('Failed to export table data');
  }
};

/**
 * Import table data from a JSON file
 * @param {File} file 
 * @returns {Promise<Object>} 
 */
export const importTableFromJson = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fileContent = event.target.result;
          const importedData = JSON.parse(fileContent);
          
          if (!importedData || !importedData.table) {
            throw new Error('Invalid table data format');
          }
          
          const requiredFields = ['name', 'columns', 'rows'];
          const missingFields = requiredFields.filter(field => !importedData.table[field]);
          
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }
          
          if (!Array.isArray(importedData.table.rows)) {
            throw new Error('Invalid rows data: expected an array');
          }
          
          if (!Array.isArray(importedData.table.columns) || importedData.table.columns.length === 0) {
            throw new Error('Invalid columns data: expected a non-empty array');
          }
          
          const tableData = {
            ...importedData.table,
            id: uuidv4(), 
            importedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          resolve(tableData);
        } catch (error) {
          console.error('Error parsing imported file:', error);
          reject(new Error(`Invalid file format: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing table:', error);
      reject(new Error(`Failed to import table: ${error.message}`));
    }
  });
};

/**
 * Export table data to CSV format
 * @param {Object} tableData 
 * @param {string} [fileName] 
 */
export const exportTableToCsv = (tableData, fileName = null) => {
  try {
    const { columns = [], rows = [] } = tableData;
    
    if (columns.length === 0) {
      throw new Error('No columns to export');
    }
    
    const headers = columns.map(col => `"${(col.name || '').replace(/"/g, '""')}"`);
    
    const csvRows = rows.map(row => {
      return columns.map(col => {
        const value = row[col.id] !== undefined ? row[col.id] : '';
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const exportFileName = fileName || `table_${tableData.name || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    
    saveAs(blob, exportFileName);
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error(`Failed to export to CSV: ${error.message}`);
  }
};

/**
 * Import table data from a CSV file
 * @param {File} file   
 * @returns {Promise<Object>} 
 */
export const importTableFromCsv = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvContent = event.target.result;
          const lines = csvContent.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length === 0) {
            throw new Error('Empty CSV file');
          }
          
          const headers = lines[0]
            .split(',')
            .map(header => header.replace(/^"|"$/g, ''));
          
          const columns = headers.map((header, index) => ({
            id: `col_${index}`,
            name: header || `Column ${index + 1}`,
            type: 'text' 
          }));
          
          const rows = [];
          for (let i = 1; i < lines.length; i++) {
            const row = {};
            const values = lines[i].match(/("[^"]*"|[^,"\s][^,\s]*|(\s*?,+?\s*?))+/g) || [];
            
            values.forEach((value, colIndex) => {
              const column = columns[colIndex];
              if (column) {
                const cleanValue = value.replace(/^"|"$/g, '').trim();
                row[column.id] = cleanValue;
              }
            });
            
            if (Object.keys(row).length > 0) {
              rows.push({
                id: `row_${i}`,
                ...row
              });
            }
          }
          
          const tableData = {
            id: uuidv4(),
            name: file.name.replace(/\.csv$/i, '') || 'Imported Table',
            description: `Imported from ${file.name} on ${new Date().toISOString()}`,
            columns,
            rows,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            metadata: {
              source: 'csv-import',
              originalFilename: file.name
            }
          };
          
          resolve(tableData);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          reject(new Error(`Invalid CSV format: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing CSV:', error);
      reject(new Error(`Failed to import CSV: ${error.message}`));
    }
  });
};

/**
 * Get the file extension from a filename
 * @param {string} filename 
 * @returns {string} 
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Handle table import based on file type
 * @param {File} file 
 * @returns {Promise<Object>} 
 */
export const importTable = async (file) => {
  const extension = getFileExtension(file.name);
  
  switch (extension) {
    case 'json':
      return importTableFromJson(file);
    case 'csv':
      return importTableFromCsv(file);
    default:
      throw new Error(`Unsupported file type: ${extension}. Please use JSON or CSV.`);
  }
};
