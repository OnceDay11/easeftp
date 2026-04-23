# EaseFTP System Design Baseline

## Initial Architecture

- Web frontend: React SPA served separately during development and deployable as static assets in production
- API service: Go HTTP server handling auth, file browsing, uploads, share validation, and audit events
- Metadata store: SQLite for accounts, permissions, file metadata, shares, and audit logs
- Storage backend: local filesystem root exposed through an internal storage abstraction

## First Implementation Slice

- Health endpoint for runtime validation
- Directory listing endpoint backed by the local filesystem
- Responsive file workspace shell in the frontend
- API client wiring for file listings

## Follow-Up Slices

- Authentication and session middleware
- Upload session protocol and resumable chunk storage
- Share creation and anonymous access flows
- Directory permission model and effective permission resolution
- Audit pipeline and admin surfaces
