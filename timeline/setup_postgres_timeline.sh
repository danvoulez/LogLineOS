#!/bin/sh
psql "$POSTGRES_URL" <<SQL
CREATE TABLE IF NOT EXISTS spans (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
SQL
