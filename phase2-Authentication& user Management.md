# Phase 2 – Authentication & User Management

## Objective

Build a secure, production-ready authentication and onboarding system for CivicLens AI.

The authentication experience should feel like a premium SaaS product with excellent UX, accessibility, responsiveness, and security.

This phase should only focus on authentication, onboarding, user profile management, and route protection.

No issue reporting or business logic should be implemented.

---

# User Roles

The application supports three user roles:

1. Citizen
2. Authority
3. Admin (Reserved for future use)

Only Citizen and Authority should be selectable during signup.

The architecture must remain extensible for Admin functionality later.

---

# Authentication Features

Implement the following:

## Login

- Email
- Password
- Remember Me
- Show/Hide Password
- Login validation
- Loading state
- Error handling
- Success feedback

---

## Signup

Collect:

- Full Name
- Email
- Password
- Confirm Password
- Role Selection

Validation:

- Password strength
- Matching passwords
- Duplicate email detection
- Required fields
- Email format

---

## Forgot Password

Allow users to:

- Enter registered email
- Receive reset password email
- Success confirmation
- Friendly error messages

---

## Email Verification

After signup:

- Send verification email
- Prevent access until email is verified
- Display verification pending screen
- Allow resend verification email

---

## Session Management

Support:

- Persistent login
- Remember Me
- Logout
- Session restoration
- Secure route protection

---

# Onboarding

After successful signup and email verification:

Redirect user to Profile Setup.

Do not directly enter the dashboard.

---

# Profile Setup

## Citizen Profile

Collect:

- Profile Photo (optional)
- Phone Number
- City
- State
- Address (optional)

---

## Authority Profile

Collect:

- Profile Photo
- Department
- Organization
- Office Location
- Phone Number

---

# Dashboard Routing

Citizen

→ Citizen Dashboard

Authority

→ Authority Dashboard

---

# Protected Routes

Protect:

Dashboard

Profile

Settings

Notifications

Future pages

Unauthenticated users should automatically redirect to Login.

Unauthorized users should see a dedicated Unauthorized page.

---

# Authentication Context

Create a reusable authentication provider.

Responsibilities:

- Current user
- Current role
- Loading state
- Login
- Signup
- Logout
- Password Reset
- Email Verification
- Session restoration

---

# Firebase Authentication

Use Firebase Authentication.

Implement:

- Email & Password Authentication
- Email Verification
- Password Reset
- Session Persistence

Do not use anonymous authentication.

---

# Firestore User Document

After successful signup:

Create a Firestore document.

Example:

users/

uid

Fields:

uid

name

email

role

profileCompleted

createdAt

updatedAt

---

# User Experience

Use the design system.

Every authentication screen must include:

- Smooth animations
- Premium cards
- Responsive layout
- Inline validation
- Friendly error messages
- Loading skeletons where appropriate

---

# Responsive Design

Authentication pages must support:

Desktop

Tablet

Mobile

---

# Accessibility

Ensure:

- Keyboard navigation
- Proper labels
- Focus indicators
- Screen reader friendly forms

---

# Error Handling

Never expose Firebase errors directly.

Convert them into user-friendly messages.

Examples:

"The password is incorrect."

"This email is already registered."

"We couldn't verify your account."

---

# Security

Do not store passwords.

Use Firebase Authentication only.

Validate user role before dashboard access.

Prevent unauthorized route access.

---

# Deliverables

By the end of Phase 2 the application should include:

✓ Login

✓ Signup

✓ Forgot Password

✓ Email Verification

✓ Remember Me

✓ Session Persistence

✓ Logout

✓ Role Selection

✓ Profile Setup

✓ Firestore User Creation

✓ Protected Routes

✓ Unauthorized Page

✓ Responsive UI

✓ Complete Authentication Context

✓ Production-ready code