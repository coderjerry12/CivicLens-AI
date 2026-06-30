# DESIGN_SYSTEM_RULES.md

# Design System Rules

This document defines reusable UI standards.

Every component generated must follow these rules.

---

# Reuse Before Create

Always reuse existing components.

Do not create duplicate buttons, cards, dialogs, or inputs.

---

# Component Library

Approved components:

* Button
* Card
* Input
* TextArea
* Select
* Badge
* Avatar
* Navbar
* Sidebar
* Modal
* Dialog
* Drawer
* Toast
* Spinner
* Skeleton
* Empty State
* Error State
* Search Bar
* Filter Panel
* Pagination
* Stat Card
* Chart Card
* Issue Card
* Notification Card

---

# Spacing

Use consistent spacing throughout the application.

Avoid arbitrary padding or margins.

---

# Icons

Use Lucide React only.

Maintain consistent icon sizing.

---

# Colors

Use only colors from the project theme.

Avoid hardcoded colors.

---

# Buttons

Primary

Secondary

Outline

Ghost

Icon

Loading

Do not invent new button styles.

---

# Cards

All cards should have:

Rounded corners

Soft shadow

Hover elevation

Consistent padding

Optional glass effect

---

# Forms

Consistent spacing

Reusable validation

Shared form controls

---

# Animations

Reuse animation utilities.

Avoid inconsistent transition timings.

---

# Naming

Use clear component names.

Examples:

IssueCard

StatCard

FilterPanel

NotificationItem

---

# Code Standards

Small reusable components

Strong typing

No duplicated logic

Readable folder structure

Meaningful variable names

---

# Performance

Lazy load pages where appropriate.

Memoize expensive components.

Avoid unnecessary re-renders.

---

# Rule

Whenever a new feature is implemented:

1. Check whether an existing component can be reused.

2. If yes, reuse it.

3. If not, extend the design system rather than creating one-off UI.