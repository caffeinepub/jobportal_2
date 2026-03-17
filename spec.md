# Online Job Portal Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Login/authentication page for users and admins
- Home/dashboard page showing portal overview
- Job listings section on the home page
- Navigation header with login/logout controls
- Role-based access (admin vs. job seeker)
- Admin panel to post/manage job listings
- Job seeker view to browse and search jobs
- User profile section (basic info, resume upload placeholder)

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan

**Backend (Motoko):**
- User roles: admin, job_seeker
- Job listings: id, title, company, location, description, requirements, salary, type (full-time/part-time/contract), status (open/closed), postedAt
- Applications: id, jobId, applicantId, status (pending/reviewed/accepted/rejected), appliedAt
- CRUD operations for jobs (admin only)
- List/search jobs (public)
- Submit/view applications (job seekers)
- Get current user profile and role

**Frontend:**
- Login page: Internet Identity authentication
- Home page: hero section, job listings grid with search/filter
- Job detail modal/page
- Admin dashboard: post jobs, manage listings, view applications
- Job seeker dashboard: browse jobs, apply, track applications
- Responsive layout with header navigation
