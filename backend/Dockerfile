FROM golang:1.26.0-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o Poster-Constructor .

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/Poster-Constructor .

EXPOSE 8889

CMD ["./Poster-Constructor"]