Phase 4 – Citizen Dashboard
🎯 Objective

Build a personalized dashboard that serves as the user's command center after login.

When a citizen logs in, they should immediately see:

Their contribution to the community
Current issue statuses
Quick actions
Recent reports
Community insights
AI recommendations

Think of it as a mix of GitHub Dashboard + Notion Home + Linear.

Phase 4 Breakdown

We'll divide this into 8 steps:

Step	Feature	Priority
1	Dashboard UI Layout	⭐⭐⭐
2	Statistics Cards	⭐⭐⭐
3	Recent Issues	⭐⭐⭐
4	Search & Filters	⭐⭐
5	Community Insights	⭐⭐
6	AI Recommendations	⭐⭐
7	Profile & Achievements	⭐
8	Responsive Polish	⭐⭐⭐

We'll do one step at a time.

Step 1 – Dashboard Layout
Goal

Create a premium dashboard shell using your design system.

No Firestore queries yet.

No backend logic.

Expected Layout
---------------------------------------------------------
Good Morning, Anupriya 👋

Let's make our community better today.

---------------------------------------------------------

[Report Issue]   [Community Feed]   [My Reports]

---------------------------------------------------------

Statistics Row

---------------------------------------------------------

Recent Reports

----------------------     ------------------------------

Community Insights          AI Suggestions

----------------------     ------------------------------

Achievements                Activity Timeline

---------------------------------------------------------
Components to Build
1. Welcome Header

Display:

Greeting
User name
Current date
Motivational subtitle

Example:

Good Morning, Anupriya 👋

You have helped improve your community by reporting 8 issues.
2. Quick Action Cards

Large cards for:

➕ Report New Issue
🌍 Explore Community
📋 My Reports

Hover animations.

Icons.

3. Statistics Section (Placeholders)

Create four cards:

Total Reports
Resolved
In Progress
Community Impact

Use placeholder values for now.

4. Recent Reports Section

Placeholder cards.

Later connected to Firestore.

5. Community Insights

Placeholder chart.

6. AI Suggestions

Placeholder panel.

Later Gemini will recommend:

Nearby unresolved issues
Trending categories
Best reporting times
7. Activity Timeline

Placeholder.

8. Responsive Layout

Desktop:

Header

Statistics

2-column content

Sidebar

Tablet:

Header

Statistics

Stacked

Mobile:

Everything stacked.


Testing Checklist
Layout
 Dashboard loads after login.
 Welcome section displays correctly.
 Quick action cards are aligned.
 Placeholder sections are visually balanced.
Responsiveness
 Desktop
 Laptop
 Tablet
 Mobile
Theme
 Light mode
 Dark mode
Navigation
 Quick action buttons route correctly (even if pages are placeholders).
Performance
 No layout shifts.
 Smooth hover animations.
 No console errors.
One enhancement I'd add

Instead of a generic greeting, make the dashboard feel AI-powered from the moment the user logs in.

For example:

Good Morning, Anupriya 👋
CivicLens AI has identified 3 unresolved infrastructure issues near your frequently reported area. Ready to make another impact?

For now, this can be placeholder text. Later, in the AI recommendations phase, it can become dynamic. It's a small detail

Phase 4 – Step 2: Dashboard Statistics (Real Firestore Data)
🎯 Objective

Replace the placeholder statistics with live data from Firestore for the currently logged-in citizen.

By the end of this step, the dashboard should automatically display:

📄 Total Reports Submitted
⏳ Pending / Active Issues
✅ Resolved Issues
🌟 Community Impact Score

No charts yet. Just the statistics cards.

Dashboard Flow
User Logs In
      ↓
Firebase Auth
      ↓
Fetch Current User
      ↓
Query Firestore (issues collection)
      ↓
Calculate Statistics
      ↓
Update Dashboard Cards
Firestore Queries

For the logged-in user's UID:

Count total issues
Count Pending
Count In Progress
Count Resolved

Do not hardcode values.

Community Impact Score

Instead of a simple number, calculate something meaningful.

Example formula:

Resolved × 10
+
In Progress × 5
+
Pending × 2

Display:

Community Impact

87 Points

Top 25% Contributor

For now, "Top Contributor" can be estimated from the score.

Card Animations

When data loads:

Skeleton loaders
Count-up animation (0 → actual value)
Small fade-in effect

This immediately makes the dashboard feel alive.

testing checklist

Verify:

 Total Reports matches Firestore.
 Pending count is correct.
 In Progress count is correct.
 Resolved count is correct.
Community Impact

Verify:

 Score updates when issue statuses change.
 Badge changes appropriately (if implemented).
Loading State
 Skeleton loaders appear while fetching.
 Count-up animation works after data loads.
Error Handling
 Simulate Firestore failure.
 Friendly error message appears.
 Dashboard remains usable.
UI Quality
 Responsive on desktop, tablet, and mobile.
 Light and dark themes work correctly.
 No console errors or TypeScript warnings.
🚀 Enhancement (Highly Recommended)

Instead of showing only numbers, make each statistics card clickable.

For example:

Total Reports → Opens "My Reports" filtered to all issues.
Pending Issues → Opens only pending reports.
Resolved Issues → Opens resolved reports.
Community Impact → Opens a contribution summary (placeholder for now).

This creates a much smoother user experience and prepares the dashboard for the later phases without needing to redesign



Phase 4 – Step 3: My Recent Reports
🎯 Objective

Replace the placeholder "Recent Reports" section with the logged-in user's actual reports from Firestore.

By the end of this step, a citizen should be able to:

View their recently reported issues
See the current status of each issue
Click any issue to open its details page
Search through their reports (basic search)
Sort by newest first

No advanced filters yet—that comes in the next step.

User Flow
Login
    ↓
Citizen Dashboard
    ↓
Recent Reports
    ↓
Click Report
    ↓
Issue Details Page
Firestore Query

Query the issues collection:

Only reports created by the current user
Order by createdAt (descending)
Initially show the latest 5 reports
Add a "View All" button for future expansion
Report Card Design

Each report card should display:

📷 Thumbnail

Large Pothole on MG Road

Road Damage

📍 MG Road, Bengaluru

High Severity

Status: Pending

Reported:
2 hours ago

Tracking ID:
CL-2026-000123

→ View Details
Status Badges

Use consistent colors:

🟡 Pending
🔵 In Progress
🟢 Resolved
🔴 Rejected (future-proof)
Search

Implement a simple search box that filters the loaded reports by:

Title
Category
Tracking ID

Search should work instantly on the client side.

Empty State

If the user has no reports, show a friendly illustration with:

No reports yet

Help improve your community by reporting your first issue.

[Report an Issue]
Loading State

While fetching:

Skeleton report cards
Smooth fade-in when loaded

Testing Checklist
Firestore Data
 Latest 5 reports load correctly.
 Ordered newest to oldest.
 Only current user's reports appear.
Report Cards
 Thumbnail displays.
 Status badge color is correct.
 Severity badge is correct.
 Tracking ID is shown.
 Relative time displays correctly.
Search
 Search by title works.
 Search by category works.
 Search by tracking ID works.
 Clearing the search restores all reports.
Navigation
 Clicking "View Details" opens the issue details page.
Empty State
 New user with no reports sees the empty state.
 "Report New Issue" button navigates correctly.
UI Quality
 Responsive on desktop, tablet, and mobile.
 Dark mode looks correct.
 No console errors or TypeScript warnings.
Why this step matters

After this step, your dashboard becomes immediately useful. A returning user can see what they've reported, check statuses, and continue tracking their contributions without leaving the dashboard.



Phase 4 – Step 4: Advanced Search, Filters & Sorting
🎯 Objective

Transform "My Reports" into a mini issue management system.

The user should be able to instantly find any report.

Final User Experience
My Reports

🔍 Search...

Category ▼

Status ▼

Severity ▼

Date ▼

Sort ▼

────────────────────────

Results

Issue Cards

────────────────────────

This should feel similar to Linear, Jira, or GitHub Issues.

Features
1. Smart Search

Search should match:

Title
Description
Category
Department
Address
Tracking ID

Search updates instantly while typing.

2. Category Filter

Examples:

All

Road Damage

Garbage

Streetlight

Water Leakage

Drainage

Traffic

Other
3. Status Filter
All

Pending

In Progress

Resolved
4. Severity Filter
All

Low

Medium

High

Critical
5. Date Filter
Today

This Week

This Month

This Year

Custom

(Custom picker can be a placeholder for now.)

6. Sorting

Allow:

Newest First

Oldest First

Highest Severity

Recently Updated

Alphabetical

Active Filter Chips

Instead of hiding selections,

show chips like:

Road Damage

High

Pending

Newest

Each chip should have an ❌ button to remove that filter.

Results Counter

Show:

18 Reports Found

Updates instantly.

Empty Results

Instead of:

"No Reports"

Display:

No reports match your filters.

Clear Filters
URL Persistence (Nice Touch)

If feasible, keep search/filter state in the URL query parameters so refreshing the page preserves the current view.

Architecture

Create:

hooks/
useReportFilters.ts

utils/
reportFilter.ts
reportSort.ts

types/
filter.ts

Keep filtering logic separate from UI.


Testing Checklist
Search
 Search by title.
 Search by description.
 Search by category.
 Search by address.
 Search by tracking ID.
Filters
 Category filter works.
 Status filter works.
 Severity filter works.
 Date filter works.
Sorting
 Newest first.
 Oldest first.
 Highest severity.
 Recently updated.
 Alphabetical.
Filter Chips
 Chips appear when filters are applied.
 Removing a chip updates the results immediately.
 "Clear Filters" resets everything.
UI
 Responsive on desktop, tablet, and mobile.
 Dark mode looks correct.
 No console errors or warnings.
One refinement I'd recommend

Instead of keeping search, filters, and sorting separate, add a saved views feature (even if it's simple). For example:

"Open Issues"
"Resolved Issues"
"High Priority"

Users can switch between these presets with one click. This makes the dashboard feel much more like a professional issue-tracking system and lays the groundwork for future enhancements without adding much implementation complexity.




I want to slightly change the roadmap.

Originally I had Community Insights before AI Recommendations.

I would swap them.

Reason:

AI sells the project.

Judges remember AI features far more than charts.

So the order becomes:

✅ Step 1 Dashboard
✅ Step 2 Statistics
✅ Step 3 Recent Reports
✅ Step 4 Search & Filters
⭐ Step 5 AI Assistant Dashboard
Step 6 Community Insights
Step 7 Profile & Achievements
Step 8 Polish
Phase 4 — Step 5
AI Dashboard Assistant ⭐⭐⭐⭐⭐

This should become the hero section of the dashboard.

Not just another card.

Think:

Microsoft Copilot

↓

Notion AI

↓

GitHub Copilot

Objective

When the user opens the dashboard,

CivicLens AI greets them with useful insights.

Instead of

Welcome Back

The dashboard says

👋 Good Morning, Anupriya

Here's what CivicLens AI noticed today.

• 3 unresolved road issues exist near your frequently reported locations.

• Your last report has been assigned to Public Works.

• Garbage complaints have increased 18% this week nearby.

• Reporting now could help prioritize municipal action.


That immediately tells judges:

This is an AI-powered civic platform.

AI Insight Cards

Create rotating insight cards.

Example

Nearby Trends
🚧

Road Damage

Trending

↑ 18%

Your Impact
🏆

You helped resolve

12

community issues

Recommendation
💡

Consider reporting

streetlights

in your area.

Multiple nearby users have reported darkness after 8 PM.

Government Activity
🏗

Municipality resolved

24

issues this week.

AI Daily Summary

Large card

Today's Summary

AI Confidence

98%

Road issues remain the most common category.

Water leakage complaints have decreased.

Public Works resolved 8 issues yesterday.

Smart Suggestions

Buttons

Report Nearby Issue

View Trending Issues

Explore Community Feed
Architecture

Create

services/

insightsService.ts

hooks/

useDashboardInsights.ts

types/

insight.ts

Later,

these services

can call Gemini.

For now,

they can intelligently summarize Firestore data.

Nice UI

Cards should animate.

Every few seconds

rotate insights

like

Google Discover.


Testing Checklist
AI Welcome
 Personalized greeting displays.
 Daily summary updates correctly.
Insight Cards
 Cards rotate smoothly.
 Placeholder data appears gracefully if Firestore lacks sufficient information.
Smart Actions
 Buttons navigate correctly.
UI
 Animations are smooth.
 Responsive across devices.
 Light and dark themes look polished.
Quality
 No console errors.
 No TypeScript warnings.
⭐ This is where CivicLens becomes memorable

At the end of this step, the dashboard won't feel like a CRUD application. It will feel like an AI assistant for civic engagement, which aligns directly with the hackathon theme and gives you a stronger story during demos:

"Our platform doesn't just collect reports—it proactively summarizes community trends and guides citizens toward meaningful actions."


Phase 4 – Step 6: Community Insights & Local Trends ⭐⭐⭐⭐⭐
Why this matters

Most civic apps only show your own reports.

CivicLens AI should answer:

"What's happening around me?"

This creates a sense of community and demonstrates AI-powered analysis.

🎯 Objective

Build a Community Insights section that visualizes local issue trends using existing Firestore data.

No live AI calls are required. Generate insights by analyzing the stored issue data.

Dashboard Layout
---------------------------------------------------

Community Insights

---------------------------------------------------

📈 Trending Categories

📊 Issue Status Distribution

🔥 Hotspot Areas

⚡ Resolution Performance

🏆 Community Contribution

---------------------------------------------------
Card 1 — Trending Categories

Analyze all issues and show the top categories.

Example:

Road Damage      42%
Garbage          28%
Streetlight      16%
Water Leakage    14%

Add:

Progress bars
Trend indicators (↑ ↓ →)
Card 2 — Issue Status Distribution

Visualize:

Pending
In Progress
Resolved

Use:

Doughnut chart
Ring chart
Animated progress bars
Card 3 — Hotspot Areas

Analyze addresses/locations.

Display:

📍 MG Road

18 Reports

🔥 High Activity

-------------------

📍 Indiranagar

12 Reports

Moderate Activity

Later this becomes a heatmap.

Card 4 — Resolution Performance

Show:

Average Resolution Time

2.8 Days

↑ 14% Faster


Initially estimate this from timestamps.

Card 5 — Community Contribution

Display:

You reported

12 Issues

8 Resolved

Community Score

420 Points

Top 18%
Insight Summary

At the top:

AI Community Summary

Road Damage continues to dominate this week.

Most reports originate from MG Road.

Resolution speed improved by 12%.

Charts

You can use:

Recharts
Chart.js
Tremor
shadcn/ui charts

Reuse chart components.

Architecture

Create:

services/

communityInsightsService.ts

hooks/

useCommunityInsights.ts

utils/

analytics.ts

types/

communityInsight.ts

Keep all aggregation logic outside React components.


Testing Checklist
Data
 Trending categories match Firestore.
 Status counts are accurate.
 Hotspot areas update with new reports.
 Community score recalculates correctly.
Charts
 Charts animate on load.
 Resize correctly on desktop, tablet, and mobile.
 Dark mode remains readable.
Empty States
 Gracefully handles no reports.
 Displays meaningful placeholder guidance.
Performance
 Dashboard loads smoothly.
 No console errors or TypeScript warnings.
🚀 Portfolio Enhancement (Highly Recommended)

Add a "This Week vs Last Week" comparison to each analytics widget. For example:

Road Damage: ↑ 15%
Garbage Complaints: ↓ 8%
Average Resolution Time: ↓ 1.2 days

Even if it's calculated from simple Firestore timestamps, it makes the analytics feel much more sophisticated and gives you excellent talking points during your hackathon presentation and future interviews.

After this step, we'll move to Phase 4 – Step 7: Profile, Achievements & Community Reputation, which introduces gamification and user engagement.


Phase 4 — Step 7
Profile, Reputation & Gamification ⭐⭐⭐⭐⭐
Why this matters

One of the judging criteria is community participation.

Instead of only reporting issues,

CivicLens AI should encourage citizens to contribute consistently.

Think:

GitHub Contributions

↓

Duolingo Streaks

↓

Google Maps Local Guides

↓

Reddit Karma

Objective

Create a profile page and reputation system that rewards community participation.

Dashboard Layout
-----------------------------------------------------

👤 My Civic Profile

-----------------------------------------------------

Avatar

Name

Community Rank

Citizen Since

Contribution Score

-----------------------------------------------------

🏆 Badges

-----------------------------------------------------

🔥 Current Streak

-----------------------------------------------------

📈 Progress

-----------------------------------------------------

Achievements

-----------------------------------------------------

Community Reputation

-----------------------------------------------------

Leaderboard Preview

-----------------------------------------------------
Section 1 — Civic Profile

Display

👤

Anupriya Mishra

Community Explorer

Citizen Since

June 2026


Add

Editable profile photo

Profile completion %

Bio

Location

Section 2 — Reputation Score

Calculate

Resolved Issues

+

Reports Submitted

+

Community Verification

+

Helpful Comments


Display

Community Score

620

Section 3 — Reputation Levels

Instead of numbers

Use levels

Seed

↓

Volunteer

↓

Guardian

↓

Community Hero

↓

City Champion

↓

Legend

Animated progress bar

Example

Guardian

█████████░░░

620 / 800 XP
Section 4 — Badges

Examples

🥇 First Report

🚧 Road Guardian

🔥 7-Day Streak

🌍 Community Hero

⚡ AI Explorer

📍 Local Reporter


Locked badges

Should appear faded

Section 5 — Achievements

Examples

Reported First Issue

Completed

────────────

5 Issues Reported

4 / 5

────────────

10 Resolved Issues

8 / 10

────────────

Verified Community Reports

12 / 20

Animated progress bars

Section 6 — Activity Calendar

Exactly like GitHub

Small heatmap

🟩🟩⬜🟩

⬜🟩🟩🟩

🟩🟩⬜🟩

Shows

Daily reporting activity

Section 7 — Leaderboard Preview

Top Contributors

🥇 Rahul

820

🥈 Priya

790

🥉 Anupriya

620


Current user highlighted

Section 8 — Milestone Timeline
Joined CivicLens

↓

First Report

↓

First Resolved Issue

↓

100 Reputation

↓

Guardian Badge

↓

Community Hero
Firestore Structure

Create

users/

uid

profile

gamification

reputation

badges

achievements
Services

Create

services/

reputationService.ts

badgeService.ts

achievementService.ts

leaderboardService.ts

hooks/

useProfile.ts

useBadges.ts

useAchievements.ts

types/

badge.ts

achievement.ts

reputation.ts

Testing Checklist
Profile
 Profile details load correctly.
 Avatar and bio update successfully (if editable).
 Profile completion reflects available information.
Reputation
 Community score updates after reporting issues.
 Level changes at defined thresholds.
 Progress bar reflects current XP.
Badges
 Badges unlock when criteria are met.
 Locked badges remain visible but disabled.
 Badge animations trigger on unlock (if implemented).
Achievements
 Progress updates automatically.
 Completed achievements are highlighted.
Activity Calendar
 Reporting activity appears on the correct dates.
 Heatmap renders correctly across themes.
Leaderboard
 Top contributors are sorted correctly.
 Logged-in user is highlighted.
Quality
 Responsive across desktop, tablet, and mobile.
 Light and dark modes are polished.
 No console errors or TypeScript warnings.
⭐ One recommendation before you implement

Since this is a hackathon project, add a small "Community Impact" section near the profile:

🌱 Estimated people benefited (calculated estimate)
🏙️ Neighborhoods improved
⏱️ Average response time for your reports
💡 AI-generated monthly contribution summary

These metrics are easy to derive from your existing data but create a much stronger narrative during demos. Instead of saying, "I reported 12 issues," your app can say, "Your contributions helped improve 3 neighborhoods and supported the resolution of 8 civic issues." That's the kind of storytelling judges tend to re