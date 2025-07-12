# LogLineOS Server

This directory contains the reference multitenant gateway for LogLineOS. It exposes
HTTP and WebSocket APIs to execute `.logline` contracts and record spans per tenant.

## Usage

```bash
# start the server
go run ./server
```

Configuration lives in `server/config/`. API keys are defined in
`api_keys.txt` and server options in `server_config.yml`.

### Routes

- `POST /commit` – execute a contract. Body: `{"contract":"path","env":{}}`
- `GET /query` – list spans for the authenticated tenant
- `GET /heartbeat` – status check
- `GET /ws` – WebSocket endpoint

Spans are stored in `server/data/spans/<tenant>.jsonl`. If PostgreSQL is enabled
in the config, spans are also inserted into the database using the schema
provided in `server/postgres/schema.sql`.
