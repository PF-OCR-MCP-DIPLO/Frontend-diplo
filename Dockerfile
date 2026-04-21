FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app

ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_API_KEY=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_KEY=$VITE_API_KEY

RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]

