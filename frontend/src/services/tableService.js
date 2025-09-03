import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const tableService = {
  getTables: async () => {
    try {
      const response = await axios.get(`${API_URL}/tables/tables-names`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data.tables || [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  getTable: async (tableId) => {
    try {
      const response = await axios.get(`${API_URL}/tables/tables/${tableId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data.table || null;
    } catch (error) {
      console.error(`Error fetching table ${tableId}:`, error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createTable: async (tableData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.post(
        `${API_URL}/tables/add-table`,
        { table_json: tableData },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  },

  deleteTable: async (tableId) => {
    try {
      await axios.delete(`${API_URL}/tables/tables/${tableId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting table ${tableId}:`, error);
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  updateTable: async (tableId, tableData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(
        `${API_URL}/tables/tables/${tableId}`,
        { table_json: tableData },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating table ${tableId}:`, error);
      throw error;
    }
  },

  compilePrompt: async (tableId, prompt) => {
    try {
      const response = await axios.post(
        `${API_URL}/tables/compile-prompt`,
        { table_id: tableId, prompts: [prompt] },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error compiling prompt:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to compile prompt. Please try again.');
    }
  }
};

export default tableService;
