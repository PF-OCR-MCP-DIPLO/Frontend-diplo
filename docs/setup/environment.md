# Variables de entorno

| Variable | Ejemplo | Obligatoria | Aplica | Riesgo |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Sí | Local, staging, prod | URL incorrecta rompe toda la app |
| `VITE_API_KEY` | `dev` | Depende | Cuando backend la exige | Se expone al build del frontend |

