# Timeline Module

This directory stores an audit-ready timeline of spans for LogLineOS. Each instance records events in `.jsonl` files and can optionally synchronize with PostgreSQL.

## Usage

1. Register the instance via `timeline_instance.logline`.
2. Append spans with `write_span.logline`.
3. Read ranges using `read_span_range.logline` or filter with `query_by_type.logline`.
4. Rotate files with `rotate_jsonl_file.logline` when they exceed the configured size.
5. Call `flush_spans.logline` to force writes to disk.
6. Run `sync_to_postgres.logline` for hybrid storage.

To enable PostgreSQL support, run `setup_postgres_timeline.sh` to create the required tables.

This module is optional and can be extracted to a separate repository without affecting the rest of LogLineOS.
