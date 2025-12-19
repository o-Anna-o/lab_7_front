import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';

// Генерация TypeScript API-клиента с axios
generateApi({
  name: 'Api.ts',                            // имя файла, который будет создан
  output: resolve(process.cwd(), './src/api'), // путь, куда положить сгенерированный API
  input: resolve(process.cwd(), './doc.json'),  
  httpClientType: 'axios'         
});
