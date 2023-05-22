# Deploying to GCP Artifactory

Location: asia-south1-docker.pkg.dev
Repo: images

## Build
docker build -t asia-south1-docker.pkg.dev/ecomscraper/images/dmedico-server:latest .

## Push
docker push asia-south1-docker.pkg.dev/ecomscraper/images/dmedico-server:latest

## Validate
gcloud artifacts docker images list asia-south1-docker.pkg.dev/ecomscraper/images/dmedico-server

## Deploy
gcloud run deploy --image asia-south1-docker.pkg.dev/ecomscraper/images/dmedico-server:latest