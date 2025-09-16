# Dockerfile for Static Timer Web Application
FROM nginx:alpine

# Copy all static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Create custom nginx configuration optimized for timer app
RUN echo 'events { \
    worker_connections 1024; \
} \
\
http { \
    include /etc/nginx/mime.types; \
    default_type application/octet-stream; \
    \
    # Logging \
    access_log /var/log/nginx/access.log; \
    error_log /var/log/nginx/error.log; \
    \
    # Basic settings \
    sendfile on; \
    tcp_nopush on; \
    tcp_nodelay on; \
    keepalive_timeout 65; \
    types_hash_max_size 2048; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    server { \
        listen 80; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        \
        # Main location block \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        \
        # Cache static assets \
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
            expires 1y; \
            add_header Cache-Control "public, immutable"; \
            add_header Access-Control-Allow-Origin "*"; \
        } \
        \
        # Special handling for audio files (for timer sounds) \
        location ~* \.(mp3|wav|ogg|m4a|aac)$ { \
            add_header Access-Control-Allow-Origin "*"; \
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS"; \
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"; \
            expires 30d; \
        } \
        \
        # Security headers \
        add_header X-Frame-Options "SAMEORIGIN" always; \
        add_header X-Content-Type-Options "nosniff" always; \
        add_header X-XSS-Protection "1; mode=block" always; \
        add_header Referrer-Policy "no-referrer-when-downgrade" always; \
        \
        # Enable CORS for API calls if needed \
        location ~* \.(json)$ { \
            add_header Access-Control-Allow-Origin "*"; \
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS"; \
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept"; \
        } \
    } \
}' > /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Add labels for better container management
LABEL maintainer="Timer App" \
      description="Static web application for timer functionality" \
      version="1.0"

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]