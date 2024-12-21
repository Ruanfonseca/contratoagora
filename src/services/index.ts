import axios from 'axios';
//process.env.NEXT_PUBLIC_API_DEV
const api = axios.create({

    baseURL: 'https://contratoagoraback.onrender.com'
});

export default api;