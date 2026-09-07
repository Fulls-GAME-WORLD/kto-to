package configs

func DevGetAppPort() string {
	PORT := "8889"
	return ":" + PORT
}

func DevGetJWTSecret() string {
	JWT_SECRET := "0000000000000000000000000000000000000000000000"
	return JWT_SECRET
}

func DevGetDBUrl() string {
	DB_URL := "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"
	return DB_URL
}
