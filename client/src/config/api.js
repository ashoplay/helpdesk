const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://10.12.49.33:5000/api' 
  : 'http://localhost:5000/api';

export default API_URL;
