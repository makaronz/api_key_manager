import { ApiService } from '../types';

export const apiServices: ApiService[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    keyName: 'OPENAI_API_KEY',
    description: 'AI language models and GPT APIs',
    website: 'https://platform.openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    loginUrl: 'https://platform.openai.com/login',
    keyUrl: 'https://platform.openai.com/api-keys',
    testEndpoint: 'https://api.openai.com/v1/models',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'ai',
    icon: 'Bot'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    keyName: 'ANTHROPIC_API_KEY',
    description: 'Claude AI assistant and language models',
    website: 'https://www.anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    loginUrl: 'https://console.anthropic.com',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    testMethod: 'POST',
    testHeaders: {
      'x-api-key': '{key}',
      'anthropic-version': '2023-06-01'
    },
    testBody: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }]
    },
    category: 'ai',
    icon: 'MessageSquare'
  },
  {
    id: 'github',
    name: 'GitHub',
    keyName: 'GITHUB_TOKEN',
    description: 'GitHub API for repositories and user data',
    website: 'https://github.com',
    docsUrl: 'https://docs.github.com/en/rest',
    loginUrl: 'https://github.com/login',
    keyUrl: 'https://github.com/settings/tokens',
    testEndpoint: 'https://api.github.com/user',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'token {key}'
    },
    category: 'development',
    icon: 'Github'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    keyName: 'STRIPE_SECRET_KEY',
    description: 'Payment processing and financial APIs',
    website: 'https://stripe.com',
    docsUrl: 'https://stripe.com/docs/api',
    loginUrl: 'https://dashboard.stripe.com/login',
    keyUrl: 'https://dashboard.stripe.com/apikeys',
    testEndpoint: 'https://api.stripe.com/v1/balance',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'other',
    icon: 'CreditCard'
  },
  {
    id: 'binance',
    name: 'Binance',
    keyName: 'BINANCE_API_KEY',
    description: 'Cryptocurrency exchange and trading APIs',
    website: 'https://www.binance.com',
    docsUrl: 'https://binance-docs.github.io/apidocs',
    loginUrl: 'https://accounts.binance.com/en/login',
    keyUrl: 'https://www.binance.com/en/my/settings/api-management',
    testEndpoint: 'https://api.binance.com/api/v3/account',
    testMethod: 'GET',
    testHeaders: {
      'X-MBX-APIKEY': '{key}'
    },
    category: 'crypto',
    icon: 'TrendingUp'
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    keyName: 'COINBASE_API_KEY',
    description: 'Cryptocurrency exchange and wallet APIs',
    website: 'https://www.coinbase.com',
    docsUrl: 'https://docs.cloud.coinbase.com',
    loginUrl: 'https://www.coinbase.com/signin',
    keyUrl: 'https://www.coinbase.com/settings/api',
    testEndpoint: 'https://api.coinbase.com/v2/user',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'crypto',
    icon: 'Coins'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    keyName: 'SENDGRID_API_KEY',
    description: 'Email delivery and marketing APIs',
    website: 'https://sendgrid.com',
    docsUrl: 'https://docs.sendgrid.com',
    loginUrl: 'https://app.sendgrid.com/login',
    keyUrl: 'https://app.sendgrid.com/settings/api_keys',
    testEndpoint: 'https://api.sendgrid.com/v3/user/profile',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'social',
    icon: 'Mail'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    keyName: 'TWILIO_AUTH_TOKEN',
    description: 'SMS, voice, and communication APIs',
    website: 'https://www.twilio.com',
    docsUrl: 'https://www.twilio.com/docs',
    loginUrl: 'https://www.twilio.com/login',
    keyUrl: 'https://console.twilio.com/project/api-keys',
    testEndpoint: 'https://api.twilio.com/2010-04-01/Accounts.json',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Basic {key}'
    },
    category: 'social',
    icon: 'Phone'
  },
  {
    id: 'aws',
    name: 'AWS',
    keyName: 'AWS_ACCESS_KEY_ID',
    description: 'Amazon Web Services cloud APIs',
    website: 'https://aws.amazon.com',
    docsUrl: 'https://docs.aws.amazon.com',
    loginUrl: 'https://console.aws.amazon.com',
    keyUrl: 'https://console.aws.amazon.com/iam/home#/security_credentials',
    testEndpoint: 'https://sts.amazonaws.com',
    testMethod: 'POST',
    testHeaders: {
      'Authorization': 'AWS4-HMAC-SHA256 {key}'
    },
    category: 'cloud',
    icon: 'Cloud'
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    keyName: 'GOOGLE_CLOUD_API_KEY',
    description: 'Google Cloud Platform APIs',
    website: 'https://cloud.google.com',
    docsUrl: 'https://cloud.google.com/docs',
    loginUrl: 'https://console.cloud.google.com',
    keyUrl: 'https://console.cloud.google.com/apis/credentials',
    testEndpoint: 'https://cloudresourcemanager.googleapis.com/v1/projects',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'cloud',
    icon: 'Cloud'
  },
  {
    id: 'discord',
    name: 'Discord',
    keyName: 'DISCORD_BOT_TOKEN',
    description: 'Discord bot and application APIs',
    website: 'https://discord.com',
    docsUrl: 'https://discord.com/developers/docs',
    loginUrl: 'https://discord.com/login',
    keyUrl: 'https://discord.com/developers/applications',
    testEndpoint: 'https://discord.com/api/v10/users/@me',
    testMethod: 'GET',
    testHeaders: {
      'Authorization': 'Bot {key}'
    },
    category: 'social',
    icon: 'MessageCircle'
  },
  {
    id: 'slack',
    name: 'Slack',
    keyName: 'SLACK_BOT_TOKEN',
    description: 'Slack workspace and bot APIs',
    website: 'https://slack.com',
    docsUrl: 'https://api.slack.com',
    loginUrl: 'https://slack.com/signin',
    keyUrl: 'https://api.slack.com/apps',
    testEndpoint: 'https://slack.com/api/auth.test',
    testMethod: 'POST',
    testHeaders: {
      'Authorization': 'Bearer {key}'
    },
    category: 'social',
    icon: 'MessageSquare'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    keyName: 'SUPABASE_ANON_KEY',
    description: 'Backend-as-a-Service and database APIs',
    website: 'https://supabase.com',
    docsUrl: 'https://supabase.com/docs',
    loginUrl: 'https://app.supabase.com/sign-in',
    keyUrl: 'https://app.supabase.com/project/_/settings/api',
    testEndpoint: 'https://your-project.supabase.co/rest/v1/',
    testMethod: 'GET',
    testHeaders: {
      'apikey': '{key}',
      'Authorization': 'Bearer {key}'
    },
    category: 'other',
    icon: 'Database'
  }
];

export const getServiceById = (id: string): ApiService | undefined => {
  return apiServices.find(service => service.id === id);
};

export const getServicesByCategory = (category: string): ApiService[] => {
  return apiServices.filter(service => service.category === category);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(apiServices.map(service => service.category)));
};