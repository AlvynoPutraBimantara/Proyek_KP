module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "E:/KP/Proyek-KP-master>/api-gateway/server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "user-service",
      script: "E:/KP/Proyek-KP-master>/backend/user-service/server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "suratmasuk-service",
      script: "E:/KP/Proyek-KP-master>/backend/suratmasuk-service/server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "suratkeluar-service",
      script: "E:/KP/Proyek-KP-master>/backend/suratkeluar-service/server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "uploads-service",
      script: "E:/KP/Proyek-KP-master>/backend/uploads-service/server.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
