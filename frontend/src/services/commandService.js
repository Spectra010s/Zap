import api from './api';

const ROUTE_MAP = {
  'home': { path: '/', pageName: 'Dashboard' },
  'dashboard': { path: '/', pageName: 'Dashboard' },
  'tables': { path: '/tables', pageName: 'Tables' },
  'spreadsheet': { path: '/tables', pageName: 'Tables' },
  'settings': { path: '/settings', pageName: 'Settings' },
};

const NAVIGATION_PREFIXES = [
  'go to',
  'navigate to',
  'show me',
  'open',
  'take me to'
];

const extractNavigationCommand = (command) => {
  const normalizedCommand = command.toLowerCase().trim();
  
  const tableMatch = normalizedCommand.match(/(create|make|new)\s+(?:a\s+)?(?:new\s+)?(?:table|spreadsheet)(?:\s+called\s+['"]([^'"]+)['"])?/i);
  if (tableMatch) {
    const tableName = tableMatch[2] || 'New Table';
    return {
      action: 'createTable',
      tableName,
      columns: ['Column 1', 'Column 2'],
      rows: [['', '']]
    };
  }

  for (const prefix of NAVIGATION_PREFIXES) {
    if (normalizedCommand.startsWith(prefix)) {
      const destination = normalizedCommand.substring(prefix.length).trim();
      const route = ROUTE_MAP[destination];
      if (route) {
        return {
          action: 'navigate',
          path: route.path,
          pageName: route.pageName
        };
      }
    }
  }

  for (const [key, route] of Object.entries(ROUTE_MAP)) {
    if (normalizedCommand === key || normalizedCommand === `${key} page`) {
      return {
        action: 'navigate',
        path: route.path,
        pageName: route.pageName
      };
    }
  }
  
  return null;
};

/**
 * Process voice commands and return appropriate actions
 * @param {string} command 
 * @returns {Promise<object>} 
 */
export const processVoiceCommand = async (command, tableName = null) => {
  if (!command || !command.trim()) {
    throw new Error('No command provided');
  }

  const normalizedCommand = command.toLowerCase().trim();
  
  const navCommand = extractNavigationCommand(normalizedCommand);
  if (navCommand) {
    return navCommand;
  }
  try {
    const formData = new URLSearchParams();
    formData.append('text', command);
    if (tableName) {
      formData.append('table_name', tableName);
    }
    
    const response = await api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data && typeof response.data.text === 'string') {
      return {
        action: 'aiResponse',
        message: response.data.text,
        isError: false
      };
    }
    
    if (response.data) {
      return {
        action: 'aiResponse',
        message: JSON.stringify(response.data),
        isError: false
      };
    }
    
    throw new Error('No valid response from AI service');
  } catch (error) {
    console.error('Error processing command with backend:', error);
    return {
      action: 'aiResponse',
      message: 'Sorry, I encountered an error processing your request.',
      isError: true
    };
  }
};

const commandService = {
  processVoiceCommand,
};

export default commandService;