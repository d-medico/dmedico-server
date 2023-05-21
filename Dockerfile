# Build dependencies
FROM golang:1.20-alpine AS baseimage
WORKDIR /app    
RUN apk update && apk add --no-cache git bash strace make
RUN git clone https://github.com/tech-greedy/generate-car.git
WORKDIR /app/generate-car
RUN go build -ldflags "-s -w" -o generate-car ./cmd/generate-car/generate-car.go
#RUN make build

FROM node:19.2-alpine as dependencies
WORKDIR /app
RUN apk update && apk add --no-cache git bash strace make
COPY --from=baseimage /app ./
    
COPY package.json ./
RUN npm install
COPY . . 
# Build production image
FROM dependencies as builder
EXPOSE 5000
CMD npm run start



#COPY generate-car/go.mod ./
#RUN go mod download 
#WORKDIR /app/generate-car


#FROM node:19.2-alpine as dependencies


