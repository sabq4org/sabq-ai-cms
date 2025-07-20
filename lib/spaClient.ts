import axios from 'axios';

const SPA_API_BASE = process.env.SPA_API_URL ?? 'https://nwDistAPI.spa.gov.sa';
const SPA_API_KEY  = process.env.SPA_API_KEY;

const instance = axios.create({
  baseURL: `${SPA_API_BASE}/ClientAppV1`,
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

// هياكل البيانات حسب الوثائق الجديدة
interface ClientInfo {
  clientName: string;
  clientKey: string;
  languageId: number; // 1 = AR, 2 = EN
}

interface GetNextNewsRequest {
  Client: ClientInfo;
  LastNewsId: number;
  BasketId: number;
  IsRecived: boolean;
  LoadMedia: boolean;
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

  const body: GetNextNewsRequest = {
    Client: {
      clientName: clientName,
      clientKey: clientKey,
      languageId: 1 // 1 = Arabic
    },
    LastNewsId: lastId,
    BasketId: basketId,
    IsRecived: false,
    LoadMedia: loadMedia,
  };

  const { data } = await instance.get('/GetNextNews', {
    data: body
  });
  return data;
}

export async function getBaskets() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get('/GetBaskets', {
    data: body
  });
  return data;
}

// دالة للحصول على حالة العقد
export async function getStatus() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get('/GetStatus', {
    data: body
  });
  return data;
}

// دالة للحصول على جميع التصنيفات
export async function getAllClassifications() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get('/GetAllClassifications', {
    data: body
  });
  return data;
}

// دالة للحصول على جميع الأولويات
export async function getAllPriorities() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get('/GetAllPriorities', {
    data: body
  });
  return data;
}

// دالة للحصول على جميع المناطق
export async function getAllRegions() {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get('/GetAllRegions', {
    data: body
  });
  return data;
}

// دالة للحصول على جميع أقسام الموقع
export async function getAllSiteSections(basketId: number = 3) {
  const clientName = process.env.SPA_CLIENT_NAME;
  const clientKey  = process.env.SPA_CLIENT_KEY;

  if (!clientName || !clientKey) {
    throw new Error('SPA_CLIENT_NAME or SPA_CLIENT_KEY is missing in env');
  }

  const body: ClientInfo = {
    clientName: clientName,
    clientKey: clientKey,
    languageId: 1 // 1 = Arabic
  };

  const { data } = await instance.get(`/GetAllSiteSections?basketId=${basketId}`, {
    data: body
  });
  return data;
}

const spaClient = {
  getNextNews,
  getBaskets,
  getStatus,
  getAllClassifications,
  getAllPriorities,
  getAllRegions,
  getAllSiteSections,
};

export default spaClient;
