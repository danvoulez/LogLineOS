# LogLineOS Gateway

This gateway is the official entry point for all apps in the LogLineOS ecosystem. It validates API keys, routes requests to backend scripts and records all network activity as spans.

## Usage

Configure tenants and apps in `config/tenants.json`. Example:

```json
{
  "tenants": {
    "voulezvous": {
      "apps": {
        "minicontratos": {
          "api_keys": ["abc123", "def456"]
        }
      }
    }
  }
}
```

Start the gateway:

```bash
./launch_gateway.sh
```

Send a request with curl:

```bash
curl -H "Authorization: Bearer abc123" http://localhost:8080/voulezvous/ping_app
```

Logs are stored in `timeline/requests.jsonl`. If the backend script fails, a fallback JSON response is returned and logged.

Run automated tests with:

```bash
./tests/curl_tests.sh
```

This module can run under `systemd` or any process manager to provide continuous service.
