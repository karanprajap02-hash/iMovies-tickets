import axiosClient from './axiosClient';

export const reviewApi = {
  getMovieReviews: async (movieId) => {
    const response = await axiosClient.get(`/movies/${movieId}/reviews`);
    return response.data;
  },

  addMovieReview: async (movieId, reviewData) => {
    const response = await axiosClient.post(`/movies/${movieId}/reviews`, reviewData);
    return response.data;
  },

  deleteMovieReview: async (movieId, reviewId) => {
    const response = await axiosClient.delete(`/movies/${movieId}/reviews/${reviewId}`);
    return response.data;
  },
};

