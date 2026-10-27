import axiosClient from './axiosClient';

export const favoriteApi = {
  getMyFavorites: async () => {
    const response = await axiosClient.get('/favorites');
    return response.data;
  },

  toggleFavorite: async (movieId) => {
    const response = await axiosClient.post(`/favorites/toggle/${movieId}`);
    return response.data;
  },

  checkFavorite: async (movieId) => {
    const response = await axiosClient.get(`/favorites/check/${movieId}`);
    return response.data;
  },

  removeFavorite: async (movieId) => {
    const response = await axiosClient.delete(`/favorites/${movieId}`);
    return response.data;
  },
};

