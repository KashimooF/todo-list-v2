FROM golang:1.25-alpine AS builder 

WORKDIR /build

COPY go.mod go.sum ./ 
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o main_app ./cmd/api/main.go 
RUN CGO_ENABLED=0 go build -o migrate_tool ./cmd/migrations/main.go 

FROM alpine:latest

RUN apk add --no-cache ca-certificates

WORKDIR /app 

COPY --from=builder /build/main_app .
COPY --from=builder /build/migrate_tool .  
COPY --from=builder /build/migrations ./migrations
COPY --from=builder /build/web ./web 

RUN chmod +x ./migrate_tool
EXPOSE 8080 

CMD [ "./main_app" ]