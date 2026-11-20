
# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the entire app to the working directory
COPY . .

# Install dependencies
RUN yarn install --frozen-lockfile

# Build the app for production
ARG BUILD_ENV=prod
RUN if [ "$BUILD_ENV" = "prod" ]; then \
      yarn run build; \
    else \
      yarn run build; \
    fi
# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine
# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration (optional)
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
