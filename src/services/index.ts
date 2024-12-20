import axios from 'axios';
//process.env.NEXT_PUBLIC_API_DEV
const api = axios.create({

    baseURL: 'http://192.168.0.14:8000'
});

export default api;