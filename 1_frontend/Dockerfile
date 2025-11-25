FROM ghcr.io/cirruslabs/flutter:3.38.2 AS build
WORKDIR /app
COPY . .

RUN flutter clean
RUN flutter create . --platforms web
RUN flutter build web --release --dart-define=API_URL=/api

FROM nginx:alpine
COPY --from=build /app/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
