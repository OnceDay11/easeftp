# EaseFTP MVP PRD

## Summary

EaseFTP MVP is a self-hosted modern web file server designed for small teams that need secure internal file distribution, reliable large-file transfer, directory-based access control, and controlled anonymous sharing. The first release prioritizes a polished browser experience, simple deployment, and clear governance over broad protocol compatibility or advanced collaboration.

## Product Goals

- Deliver a modern browser-based file workspace that feels faster and simpler than traditional shared folders or FTP tools
- Support reliable upload and download of large files through resumable transfer and visible progress
- Provide directory-based access control that is understandable for admins and predictable for members
- Enable anonymous download links only for lowest-classification documents, with strong auditability
- Ensure the full core workflow works well on desktop and mobile browsers

## Non-Goals

- Replace cloud office collaboration suites
- Support FTP, SFTP, WebDAV, or NAS interoperability in MVP
- Provide distributed storage, clustering, or multi-region deployment
- Build native desktop or mobile apps in the first release
- Offer rich in-browser editing or advanced document rendering

## Users

- Team administrator: deploys the service, manages users, directories, permissions, shares, and audit visibility
- Team member: browses authorized directories, uploads and manages files, creates approved shares, and previews supported content
- Anonymous recipient: accesses a share link to download an approved low-classification document without logging in

## Core Use Cases

1. An admin creates top-level directories for teams or projects and assigns inherited directory permissions to members.
2. A member uploads a large file set through drag-and-drop, tracks progress, and resumes after interruption.
3. A member creates a time-limited anonymous download link for a file that is eligible for external sharing.
4. A recipient opens the link, passes optional password verification if enabled, previews the file if supported, and downloads it.
5. An admin reviews upload, download, login, and share events in the audit timeline.

## Functional Scope

### Authentication and Sessions

- Admin and member login
- Session lifecycle management
- Basic account status controls

### Directory and File Management

- Directory tree and breadcrumb navigation
- File list and grid views
- Create, rename, move, delete, and search by filename or metadata
- Batch selection and bulk actions where appropriate

### Upload and Transfer

- Drag-and-drop uploads
- Chunked and resumable upload sessions
- Concurrent upload queue with progress, retry, and failure states
- Download streaming for large files

### Sharing

- Create anonymous download links only for eligible lowest-classification files
- Optional password protection
- Expiration time controls
- Share access audit trail

### Permissions and Governance

- Directory-level permission assignment
- Inheritance visualization and exception handling
- Classification-aware sharing validation
- Admin visibility into active shares and permission changes

### Audit and Operations

- Activity timeline for uploads, downloads, shares, logins, and admin actions
- Basic storage usage metrics
- Recent events view for operational oversight

### Preview

- Inline preview for images
- Inline preview for PDFs
- Text preview for plain text files
- Metadata panel for unsupported file types

## Permission and Classification Model

### Roles

- Admin: full system access including user, permission, share, and audit management
- Member: access limited by assigned directory permissions and allowed actions within those directories

### Directory Permissions

- Permissions are attached to directories, not individual files
- Child directories inherit parent permissions by default
- Explicit overrides can narrow or broaden access for a child directory when configured by an admin
- Effective permissions must be visible in the admin UI

### Suggested Action Levels

- View
- Upload
- Edit metadata and rename
- Delete and move
- Share eligible files

### Document Classification

- Public-shareable: eligible for anonymous sharing
- Internal: viewable by authorized users but not eligible for anonymous sharing
- Restricted: tighter internal handling and never eligible for anonymous sharing

### Share Eligibility Rule

- Only files marked Public-shareable may generate anonymous links
- Attempts to create anonymous links for higher-classification files must be rejected and logged as policy-denied actions

## Core Pages

- Login page
- File workspace
- Share access page
- Admin console

## Acceptance Criteria

1. Admins can create directory structures and assign inherited permissions that members experience consistently in the UI and API.
2. Members can upload large files with resumable behavior and see clear progress, retry, and failure states.
3. Members can create anonymous links only for files marked Public-shareable.
4. Anonymous recipients can access valid links, satisfy password requirements when configured, and download files from desktop or mobile browsers.
5. Audit views show share creation, share access, uploads, downloads, logins, and permission changes with enough context for admin review.
6. Supported preview types render inline; unsupported files fall back to metadata and download actions without broken UI states.

## Technical Baseline

- Backend: Go
- Frontend: React + Vite
- UI stack: Tailwind CSS + Radix UI + shadcn/ui
- Client data: TanStack Query + Zustand
- Metadata store: SQLite
- Storage abstraction: local filesystem roots with future backend expansion in mind
