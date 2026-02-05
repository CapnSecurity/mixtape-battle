# Secure Invite-Only User Onboarding Plan

## Overview
Lock down user registration so only authorized admins can invite new users. Reuse and secure the existing `/invite` page for this flow.

## Steps

1. **Admin-Only Access to Invite Page**
   - Restrict `/invite` page to users with `isAdmin` flag (middleware + UI check).
   - Only admins can generate invites.

2. **Invite Flow (Reuse Existing Page)**
   - On `/invite`, admin enters email to invite.
   - Generate a secure, single-use invite token (random, expires in X days).
   - Store in new `Invite` table: `{ id, email, token, expiresAt, usedAt, invitedByUserId }`.
   - Email invite link (e.g. `/signup?token=...`) to recipient.

3. **Signup/Password Setup via Invite**
   - Create `/signup` page (or adapt existing) to accept invite token.
   - Validate token (exists, not expired/used).
   - Allow user to set password and create account.
   - Mark invite as used after signup.

4. **Disable Public Magic Link/Email Auth**
   - Remove or disable public magic link/email sign-in.
   - Only allow sign-in for existing users.

5. **Admin Role Management**
   - Add `isAdmin` boolean to `User` model if not present.
   - Only admins can access `/invite` and send invites.

6. **Middleware/Route Protection**
   - Update middleware to restrict `/invite` and admin routes.
   - `/signup` only works with valid invite token.

7. **(Optional) Audit/Logging**
   - Log invite creation, usage, and failed attempts.

## Migration/Implementation Tasks
- Add `Invite` model and migration.
- Lock down `/invite` page (middleware + UI).
- Build/adapt `/signup` for invite flow.
- Remove public magic link sign-in.
- Add admin flag to your user if needed.

---

**First steps tomorrow:**
- Add `Invite` model, lock `/invite`, and disable public self-signup.
