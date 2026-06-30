Phase 6 – Community Collaboration & Real-Time Engagement
Objective

Transform CivicLens AI from an issue reporting platform into a collaborative civic engagement platform.

Users should not only report issues but also discover nearby reports, verify existing issues, collaborate with other citizens, receive live updates, and track community impact.

Deliverables
Module 1 — Community Feed

Build a modern community feed showing public issues.

Each issue card should contain:

Issue image
Title
Category
Severity badge
Status badge
Address
Time reported
AI confidence
Number of verifications
Number of comments
Reporter reputation (optional)
"View Details" button

Support:

Infinite scrolling or pagination
Responsive card layout
Dark mode
Skeleton loaders
Empty states
Module 2 — Smart Search & Filters

Support filtering by:

Category
Severity
Status
Department
Distance (if location available)
Date
AI confidence

Support searching by:

Title
Description
Address
Tracking ID
Module 3 — Community Verification

Instead of duplicate reports,

citizens can click

✅ Same Problem Exists

System should

increase verification count
prevent duplicate verification
store verifier ID
update Firestore

Display

Verified by 18 Citizens
Module 4 — Community Discussion

Each issue supports:

Comments
Replies (one level)
Edit own comment
Delete own comment
Relative timestamps
User avatar
User reputation badge

Sort:

Newest

Oldest

Most Helpful

Module 5 — Follow Issues

Citizen can

⭐ Follow Issue

Receive future updates.

Store

followers

userIds[]
Module 6 — Nearby Issues

Using coordinates

Display

Nearby Reports

within

1km

3km

5km

Support

Map

List

Module 7 — Live Notifications

Notification Center

Display

Issue Assigned

Issue Resolved

New Comment

Authority Response

Verification Milestone

Support

Unread badge

Mark All Read

Real-time Firestore listeners

Module 8 — Community Reputation

Every action increases score

Report Issue

+20

Verification

+5

Helpful Comment

+3

Resolved Issue

+30

Leaderboard updates automatically.

Module 9 — AI Community Insights

Generate insights like

Road damage complaints increased 18%.

Garbage complaints are decreasing.

Your neighborhood has 12 unresolved issues.

Two nearby issues match your interests.


Initially rule-based.

Keep architecture Gemini-ready.

Module 10 — Public Issue Details

Issue page should include

Image

Timeline

Comments

Verifications

Followers

Map

AI Analysis

Related Issues

Authority Updates

Resolution Notes

Module 11 — Real-Time Updates

Every page should automatically refresh when

new issue created
issue resolved
comment added
verification added
follower count changes
authority updates status

Use Firestore listeners.

Module 12 — Performance & Polish

Implement

Loading skeletons
Error boundaries
Empty states
Toast notifications
Lazy loading
Optimistic updates
Responsive design
Dark mode
Accessibility
Firestore Collections
issues/

comments/

notifications/

followers/

verifications/

leaderboard/

users/

Extend existing documents instead of creating unnecessary collections where possible.

Architecture

Create

services/

communityFeedService.ts
commentService.ts
verificationService.ts
notificationService.ts
followService.ts
reputationService.ts
communityInsightService.ts

hooks/

useCommunityFeed.ts
useComments.ts
useNotifications.ts
useVerification.ts
useFollowing.ts

types/

community.ts
comment.ts
notification.ts
verification.ts

Business logic must remain outside UI components.

