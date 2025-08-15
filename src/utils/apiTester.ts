import { TestResult } from '../types';
import { apiServices } from '../data/apiServices';

/**
 * Test an API key by making a request to the service's test endpoint
 */
/**
 * Test all API keys for all services
 */
export const testAllApiKeys = async (apiKeys: Array<{service: string, value: string}>): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  
  for (const keyData of apiKeys) {
    try {
      const result = await testApiKey(keyData.service, keyData.value);
      results.push(result);
    } catch (error) {
      results.push({
        service: keyData.service,
        success: false,
        isValid: false,
        responseTime: 0,
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
  
  return results;
};

export const testApiKey = async (serviceId: string, apiKey: string): Promise<TestResult> => {
  const service = apiServices.find(s => s.id === serviceId);
  if (!service) {
    throw new Error(`Service ${serviceId} not found`);
  }

  const startTime = Date.now();
  
  try {
    const isValid = await performApiTest(serviceId, apiKey);
    const endTime = Date.now();
    
    return {
      service: serviceId,
      success: isValid,
      isValid,
      responseTime: endTime - startTime,
      timestamp: new Date(),
      message: isValid ? 'API key is valid' : 'API key validation failed'
    };
  } catch (error) {
    const endTime = Date.now();
    
    return {
      service: serviceId,
      success: false,
      isValid: false,
      responseTime: endTime - startTime,
      timestamp: new Date(),
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Perform the actual API test for a specific service
 */
const performApiTest = async (serviceId: string, apiKey: string): Promise<boolean> => {
  const testConfigs: Record<string, () => Promise<boolean>> = {
    'openai': () => testOpenAI(apiKey),
    'anthropic': () => testAnthropic(apiKey),
    'github': () => testGitHub(apiKey),
    'stripe': () => testStripe(apiKey),
    'binance': () => testBinance(apiKey),
    'coinbase': () => testCoinbase(apiKey),
    'sendgrid': () => testSendGrid(apiKey),
    'twilio': () => testTwilio(apiKey),
    'aws': () => testAWS(apiKey),
    'google-cloud': () => testGoogleCloud(apiKey),
    'discord': () => testDiscord(apiKey),
    'slack': () => testSlack(apiKey),
    'supabase': () => testSupabase(apiKey)
  };

  const testFunction = testConfigs[serviceId];
  if (!testFunction) {
    throw new Error(`No test configuration for service: ${serviceId}`);
  }

  return await testFunction();
};

/**
 * Test OpenAI API key
 */
const testOpenAI = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Anthropic API key
 */
const testAnthropic = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    return false;
  }
};

/**
 * Test GitHub API key
 */
const testGitHub = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Stripe API key
 */
const testStripe = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Binance API key
 */
const testBinance = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/account', {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    });
    
    // Binance returns 400 for missing signature, but 401 for invalid API key
    return response.status !== 401;
  } catch (error) {
    return false;
  }
};

/**
 * Test Coinbase API key
 */
const testCoinbase = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.coinbase.com/v2/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test SendGrid API key
 */
const testSendGrid = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Twilio API key
 */
const testTwilio = async (apiKey: string): Promise<boolean> => {
  try {
    // For Twilio, we need both Account SID and Auth Token
    // This is a simplified test that checks if the token format is valid
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`ACtest:${apiKey}`)}`
      }
    });
    
    return response.status !== 401;
  } catch (error) {
    return false;
  }
};

/**
 * Test AWS API key
 */
const testAWS = async (apiKey: string): Promise<boolean> => {
  // AWS requires complex signature process, so we'll do a basic format validation
  try {
    // AWS Access Key ID format: 20 characters, starts with AKIA
    const isValidFormat = /^AKIA[0-9A-Z]{16}$/.test(apiKey);
    return isValidFormat;
  } catch (error) {
    return false;
  }
};

/**
 * Test Google Cloud API key
 */
const testGoogleCloud = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${apiKey}`, {
      method: 'GET'
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Discord API key
 */
const testDiscord = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${apiKey}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Test Slack API key
 */
const testSlack = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.ok === true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Test Supabase API key
 */
const testSupabase = async (apiKey: string): Promise<boolean> => {
  try {
    // Supabase anon key format validation
    // Should be a JWT token
    const parts = apiKey.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode the header to verify it's a JWT
    try {
      const header = JSON.parse(atob(parts[0]));
      return header.alg && header.typ === 'JWT';
    } catch {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Get test endpoint information for a service
 */
export const getTestEndpointInfo = (serviceId: string): { endpoint: string; method: string; description: string } | null => {
  const endpoints: Record<string, { endpoint: string; method: string; description: string }> = {
    'openai': {
      endpoint: 'https://api.openai.com/v1/models',
      method: 'GET',
      description: 'Lists available models'
    },
    'anthropic': {
      endpoint: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      description: 'Sends a test message'
    },
    'github': {
      endpoint: 'https://api.github.com/user',
      method: 'GET',
      description: 'Gets authenticated user info'
    },
    'stripe': {
      endpoint: 'https://api.stripe.com/v1/balance',
      method: 'GET',
      description: 'Retrieves account balance'
    },
    'binance': {
      endpoint: 'https://api.binance.com/api/v3/account',
      method: 'GET',
      description: 'Gets account information'
    },
    'coinbase': {
      endpoint: 'https://api.coinbase.com/v2/user',
      method: 'GET',
      description: 'Gets user profile'
    },
    'sendgrid': {
      endpoint: 'https://api.sendgrid.com/v3/user/profile',
      method: 'GET',
      description: 'Gets user profile'
    },
    'twilio': {
      endpoint: 'https://api.twilio.com/2010-04-01/Accounts.json',
      method: 'GET',
      description: 'Lists account information'
    },
    'aws': {
      endpoint: 'Format validation only',
      method: 'N/A',
      description: 'Validates Access Key ID format'
    },
    'google-cloud': {
      endpoint: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
      method: 'GET',
      description: 'Validates access token'
    },
    'discord': {
      endpoint: 'https://discord.com/api/v10/users/@me',
      method: 'GET',
      description: 'Gets bot user information'
    },
    'slack': {
      endpoint: 'https://slack.com/api/auth.test',
      method: 'POST',
      description: 'Tests authentication'
    },
    'supabase': {
      endpoint: 'JWT format validation',
      method: 'N/A',
      description: 'Validates JWT token format'
    }
  };

  return endpoints[serviceId] || null;
};

/**
 * Check if a service supports real API testing
 */
export const supportsRealTesting = (serviceId: string): boolean => {
  const realTestingServices = [
    'openai', 'anthropic', 'github', 'stripe', 'coinbase', 
    'sendgrid', 'discord', 'slack'
  ];
  
  return realTestingServices.includes(serviceId);
};

/**
 * Get testing limitations for a service
 */
export const getTestingLimitations = (serviceId: string): string[] => {
  const limitations: Record<string, string[]> = {
    'binance': ['Requires API secret for full validation', 'Only checks API key format'],
    'twilio': ['Requires Account SID for full validation', 'Uses test Account SID'],
    'aws': ['Requires Secret Access Key for full validation', 'Only validates format'],
    'google-cloud': ['May require additional scopes', 'Limited to token validation'],
    'supabase': ['Only validates JWT format', 'Does not test actual database access']
  };
  
  return limitations[serviceId] || [];
};