import axios from "axios";

const API_URL = process.env.SPA_API_URL!;
const API_KEY = process.env.SPA_API_KEY!;
const CUSTOMER_KEY = process.env.SPA_CUSTOMER_KEY!;
const CLIENT_NAME = process.env.SPA_CLIENT_NAME!;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "API-KEY": API_KEY,
});

// Get Baskets - جلب السلال المتاحة
export async function getSpaBaskets() {
  const payload = {
    client_name_TXT: CLIENT_NAME,
    client_key_TXT: CUSTOMER_KEY,
  };
  
  try {
    const { data } = await axios.post(
      `${API_URL}ClientAppV1/GetBaskets`, 
      payload, 
      { headers: getHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error fetching SPA baskets:", error);
    throw error;
  }
}

// Get Next News - جلب الأخبار التالية
export async function getSpaNextNews({
  basket_CD,
  last_news_CD = 0,
  IS_recived = false,
  IS_load_media = true,
}: {
  basket_CD: number;
  last_news_CD?: number;
  IS_recived?: boolean;
  IS_load_media?: boolean;
}) {
  const payload = {
    Client: {
      client_name_TXT: CLIENT_NAME,
      client_key_TXT: CUSTOMER_KEY,
    },
    last_news_CD,
    basket_CD,
    IS_recived,
    IS_load_media,
  };
  
  try {
    const { data } = await axios.post(
      `${API_URL}ClientAppV1/GetNextNews`, 
      payload, 
      { headers: getHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error fetching SPA news:", error);
    throw error;
  }
}

// Get Previous News - جلب الأخبار السابقة
export async function getSpaPreviousNews({
  basket_CD,
  last_news_CD,
  IS_recived = false,
  IS_load_media = true,
}: {
  basket_CD: number;
  last_news_CD: number;
  IS_recived?: boolean;
  IS_load_media?: boolean;
}) {
  const payload = {
    Client: {
      client_name_TXT: CLIENT_NAME,
      client_key_TXT: CUSTOMER_KEY,
    },
    last_news_CD,
    basket_CD,
    IS_recived,
    IS_load_media,
  };
  
  try {
    const { data } = await axios.post(
      `${API_URL}ClientAppV1/GetPreviousNews`, 
      payload, 
      { headers: getHeaders() }
    );
    return data;
  } catch (error) {
    console.error("Error fetching previous SPA news:", error);
    throw error;
  }
}

// Helper function to format SPA news for display
export function formatSpaNews(news: any) {
  return {
    id: news.news_NUM,
    title: news.title_TXT,
    story: news.story_TXT,
    date: new Date(news.news_DT),
    priority: news.news_priority_CD,
    isBreaking: news.news_priority_CD === 1,
    isReport: news.iS_Report,
    media: news.media_FL || [],
    keywords: news.keywords || [],
    royalType: news.royalType,
    relatedNewsId: news.related_news_CD,
    basketId: news.news_basket_CD,
    classId: news.news_class_CD,
  };
} 