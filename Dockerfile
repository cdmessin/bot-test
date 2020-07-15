FROM node:alpine
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 7001
CMD ["node","--use_strict" ,"index.js"]