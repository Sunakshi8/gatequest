import API from './api';

export const getQuestions = (params) => API.get('/quiz/questions', { params });
export const submitAnswer = (data) => API.post('/quiz/answer', data);
export const completeGame = (data) => API.post('/quiz/complete', data);
export const useLifeline = (data) => API.post('/quiz/lifeline', data);
export const getSubjects = () => API.get('/quiz/subjects');
export const getLeaderboard = (params) => API.get('/leaderboard', { params });
export const getUserRank = (userId) => API.get(`/leaderboard/rank/${userId}`);
export const getAllBadges = () => API.get('/badges/all');
export const getJokes = () => API.get('/jokes');
export const getActiveRooms = () => API.get('/rooms');
