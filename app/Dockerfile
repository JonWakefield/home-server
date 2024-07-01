FROM golang:1.23-rc-bookworm


ENV TZ=America/Denver \
    GOOS=linux 

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build cmd/main.go

# CMD ["./main"]