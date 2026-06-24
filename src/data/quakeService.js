import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000, 
});

const FEED_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';


export const getQuakes = async (range = 'all_day') => {
  try {
    const response = await apiClient.get(`${FEED_BASE}/${range}.geojson`);
    return response.data; 
  } catch (error) {
    console.error("Lỗi khi fetch danh sách:", error);
    throw error; 
  }
};


export const getQuakeDetail = async (id) => {
  try {
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query`;
    const response = await apiClient.get(url, {
      params: {
        eventid: id,
        format: 'geojson'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết ${id}:`, error);
    throw error;
  }
};