package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"gopkg.in/yaml.v3"
	serverpostgres "motorcodex/server/postgres"
)

type Config struct {
	Port        int    `yaml:"port"`
	Debug       bool   `yaml:"debug"`
	UsePostgres bool   `yaml:"use_postgres"`
	PostgresDSN string `yaml:"postgres_dsn"`
}

func loadConfig(path string) (Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return Config{}, err
	}
	defer f.Close()
	var cfg Config
	dec := yaml.NewDecoder(f)
	if err := dec.Decode(&cfg); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func main() {
	cfg, err := loadConfig("server/config/server_config.yml")
	if err != nil {
		log.Fatal(err)
	}
	auth, err := LoadAuth("server/config/api_keys.txt")
	if err != nil {
		log.Fatal(err)
	}
	var db *sql.DB
	if cfg.UsePostgres {
		db, err = serverpostgres.Connect(cfg.PostgresDSN)
		if err != nil {
			log.Fatal(err)
		}
	}
	logger := NewLogger("server/data/spans", db)
	os.MkdirAll("server/data/spans", 0755)
	heart := NewHeartbeat()
	heart.Start()
	rt := &Router{Auth: auth, Logger: logger, Heart: heart}
	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("server listening on %s", addr)
	Recovery(func() { log.Fatal(http.ListenAndServe(addr, rt)) })
}
