import axios from 'axios';

const SPA_API_BASE = process.env.SPA_API_URL ?? 'https://nwdistapi.spa.gov.sa';
const SPA_API_KEY  = process.env.SPA_API_KEY;

const instance = axios.create({
  baseURL: SPA_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': SPA_API_KEY ?? '',
  },
  timeout: 30000, // زيادة المهلة إلى 30 ثانية
});

// إضافة interceptor لتسجيل الطلبات والاستجابات
instance.interceptors.request.use(
  (config) => {
    console.log('SPA API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('SPA API Request Error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    console.log('SPA API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('SPA API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// هياكل البيانات حسب الوثائق
interface ContractInfo {
  client_name_TXT: string;
  client_key_TXT: string;
}

interface Condition {
  Client: ContractInfo;
  last_news_CD: number;
  basket_CD: number;
  IS_recived: boolean;
  IS_load_media: boolean;
}

export async function getNextNews(
  lastId: number = 0,
  basketId: number = 1,
  loadMedia: boolean = true
) {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: Condition = {
    Client: {
      client_name_TXT: clientName,
      client_key_TXT: clientKey,
    },
    last_news_CD: lastId,
    basket_CD: basketId,
    IS_recived: false,
    IS_load_media: loadMedia,
  };

  const { data } = await instance.post('/GetNextNews', body);
  return data;
}

export async function getBaskets() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ContractInfo = {
    client_name_TXT: clientName,
    client_key_TXT: clientKey,
  };

  const { data } = await instance.post('/GetBaskets', body);
  return data;
}

// دالة للحصول على حالة العقد
export async function getStatus() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ContractInfo = {
    client_name_TXT: clientName,
    client_key_TXT: clientKey,
  };

  const { data } = await instance.post('/GetStatus', body);
  return data;
}

// دالة للحصول على جميع التصنيفات
export async function getAllClassifications() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ContractInfo = {
    client_name_TXT: clientName,
    client_key_TXT: clientKey,
  };

  const { data } = await instance.post('/GetAllClassifications', body);
  return data;
}

// دالة للحصول على جميع الأولويات
export async function getAllPriorities() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ContractInfo = {
    client_name_TXT: clientName,
    client_key_TXT: clientKey,
  };

  const { data } = await instance.post('/GetAllPriorities', body);
  return data;
}

const spaClient = {
  getNextNews,
  getBaskets,
  getStatus,
  getAllClassifications,
  getAllPriorities,
};

export default spaClient;
