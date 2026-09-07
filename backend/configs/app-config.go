package configs

func GetAppPort() string {
	SERVER_PORT := "8889"
	return ":" + SERVER_PORT
}

func GetDBUrl() string {
	DB_URL := "postgres://postgres:postgres@localhost:19930/kak_to?sslmode=disable"
	return DB_URL
}