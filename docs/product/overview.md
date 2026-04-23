# EaseFTP Product Overview

EaseFTP is a self-hosted web file server for small teams that need a modern internal file workspace without relying on consumer cloud drives or legacy FTP tooling. The product focuses on three priorities in its first release: a polished browser experience, reliable large-file transfer, and simple but enforceable access governance.

## Product Positioning

- Audience: small teams sharing project assets, documents, and internal deliverables
- Deployment: single-node self-hosted web service
- Delivery model: browser-first product with responsive desktop and mobile support
- Scope boundary: modern web file server, not a legacy FTP compatibility layer

## Core Value

- Replace shared folders and dated file tools with a cleaner browser workflow
- Make upload, browse, preview, and share actions fast and understandable
- Control external sharing through classification-aware anonymous links
- Keep governance lightweight through directory-based permissions and audit trails

## MVP Highlights

- Modern file workspace with directory tree, breadcrumbs, list/grid toggles, and batch actions
- Large-file upload reliability through resumable transfer sessions and visible progress
- Anonymous download links for lowest-classification files only
- Directory-based access control with inheritance and explicit exceptions
- Lightweight previews for images, PDFs, text, and metadata fallback
- Audit visibility for uploads, downloads, shares, logins, and permission changes

## Product Principles

- Keep the common workflow shallow: browse, upload, share, and download should stay obvious
- Prefer visible system state over hidden background behavior
- Default to least privilege while still making external sharing practical
- Treat mobile as a first-class experience for share access and light browsing
