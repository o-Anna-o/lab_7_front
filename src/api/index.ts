import { Api } from './Api';
import { getToken } from '../auth';

// Create a more robust security worker
const securityWorker = async () => {
  const token = getToken();
  console.log('[API] securityWorker, token:', token);
  
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  return {};
};

export const api = new Api({
  baseURL: '',
  withCredentials: true,
  securityWorker,
});

// export const updateRequestShip = (id: number, data: any) => {
//   return api.requestShip.updateRequestShip(id, data);
// };


