Issue Reporting
        ↓
Image Upload
        ↓
Image Preview
        ↓
Gemini AI Analysis
        ↓
AI Result Review
        ↓
Google Maps Location
        ↓
Submit Report
        ↓
Firestore + Storage
        ↓
Success Flow
        ↓
Issue Details Page


Step 1 — Create the Report Issue Page

Goal: Build only the UI shell. No backend.

Components
Report Issue Page
Hero Header
Upload Card
AI Analysis Card (placeholder)
Location Card (placeholder)
Submit Button (disabled)
Responsive layout


Step 2: Interactive Image Upload
🎯 Goal

Transform the placeholder upload card into a beautiful, fully interactive upload component.

At the end of this step:

✅ User can drag & drop an image

✅ User can browse for an image

✅ Image preview appears

✅ User can remove the image

✅ User can replace the image

✅ Validation works

❌ No Firebase

❌ No AI

❌ No Backend

Image stays only in React state.

Before Coding

Tell Kiro:

This step should only implement the upload experience.

Do not upload files anywhere.

Do not implement AI.

Do not implement form submission.

The selected image should remain in local component state only.

Testing Checklist

Spend around 15 minutes testing.

Empty State
 Upload illustration visible
 Instructions clear
 Browse button visible
Drag & Drop
 Border changes
 Background changes
 Icon animates
 Drop works
Browse
 Opens file picker
 Select image
 Preview appears
Preview
 Large preview
 Correct filename
 Correct file size
 Correct file type
Remove
 Remove button works
 Returns to empty state
Replace
 Replace works
 Old image removed
 New image displayed
Validation

Try:

PDF
ZIP
TXT
15 MB image

Expected:

 Friendly error
 No crash
 Previous image remains (if already selected)
Theme

Check:

 Light mode
 Dark mode
Responsive

Check:

Desktop
Tablet
Mobile
Console
 No errors
 No warnings
Don't Move Ahead Until...

At the end of Step 2, the upload component should feel polished enough that it could be reused in another application.

A user should think, "This already feels like a finished product," even though no backend exists yet.



Step 3: Firebase Storage Integration
🎯 Objective

Convert the local image upload into a real upload workflow.

By the end of this step:

✅ User selects an image

✅ Image uploads to Firebase Storage

✅ Upload progress is shown

✅ Download URL is generated

✅ Download URL is stored in React state

❌ No Gemini

❌ No Firestore

❌ No report submission

Upload Flow
Select Image
      ↓
Local Preview
      ↓
Click "Upload"
      ↓
Firebase Storage Upload
      ↓
Progress Indicator
      ↓
Upload Complete
      ↓
Receive Download URL
      ↓
Store URL in local state
Firebase Storage Structure

Ask Kiro to organize uploads like this:

issue-images/
    ├── userId/
    │      ├── timestamp_filename.jpg
    │      ├── timestamp_filename2.jpg

Example:

issue-images/

K8HJG82H/

1719812456112_pothole.jpg

This prevents filename collisions and keeps uploads organized.

Component Changes

Your upload component should now have these states:

Empty

↓

Image Selected

↓

Uploading

↓

Upload Complete

↓

Ready for AI Analysis


Testing Checklist
Upload Success

Test with:

JPG
PNG
WEBP

Verify:

 Upload completes.
 Progress bar reaches 100%.
 Success message appears.
 Preview remains visible.
Firebase Console

Open Firebase Storage.

Verify:

issue-images/

userId/

timestamp_filename.jpg

exists.

Download URL

Verify:

 URL is generated.
 URL is stored in component state.
 Refreshing the page clears local state (expected for now).
Retry

Temporarily disconnect the internet or simulate an error.

Check:

 Friendly error message.
 Retry button appears.
 Retry works without reselecting the file.
Duplicate Click

Rapidly click Upload.

Expected:

 Only one upload starts.
 Button remains disabled during upload.
Theme & Responsiveness

Verify:

Light mode
Dark mode
Desktop
Tablet
Mobile
Console

Confirm:

 No JavaScript errors.
 No React warnings.
 No TypeScript errors.
Phase 3 Status

After Step 3, your project will have:

✅ Beautiful Report Issue page
✅ Interactive upload component
✅ Firebase Storage integration

The user can now upload an image and receive a valid download URL. That download URL becomes the input for the next step: Gemini AI image analysis.

Before moving to Step 4

Make sure your Firebase Storage Security Rules are configured appropriately for development (and tightened before deployment). Also verify that the generated download URL can actually be used to display the uploaded image in the app. This will prevent integration issues when Gemini needs to analyze the uploaded image in the next step.


Phase 3 – Step 4
AI Image Analysis with Gemini
Objective

The uploaded image should be analyzed by Gemini.

The user should not manually choose:

Category
Severity
Department
Title
Description

AI should generate these.

The user only reviews them.

Architecture

Ask Kiro to follow this architecture exactly.

ReportIssuePage

↓

useAIAnalysis()

↓

aiService.ts

↓

Gemini API

↓

JSON Parser

↓

Type Validation

↓

React State

↓

UI

Notice that the page never calls Gemini directly.

Files Kiro Should Create
services/

aiService.ts

hooks/

useAIAnalysis.ts

types/

aiAnalysis.ts

utils/

jsonValidator.ts

prompts/

municipalPrompt.ts

Everything AI-related should stay isolated.

Gemini Prompt Engineering

This is where you outperform most hackathon projects.

Don't send:

"Analyze this image."

Instead, create a reusable prompt.

Tell Kiro to put it in:

prompts/municipalPrompt.ts
Prompt
You are an expert municipal infrastructure inspector.

Your task is to analyze community infrastructure issues from uploaded photographs.

Return ONLY valid JSON.

Do not return Markdown.

Do not explain your reasoning.

If uncertain, provide your best estimate.

Return this schema exactly:

{
  "category":"",
  "severity":"",
  "department":"",
  "title":"",
  "description":"",
  "confidence":95
}

Allowed Categories:

Road Damage
Garbage
Water Leakage
Streetlight
Traffic Signal
Drainage
Public Property Damage
Illegal Dumping
Encroachment
Other

Allowed Severity:

Low

Medium

High

Critical

Allowed Departments:

Public Works

Water Department

Sanitation

Electricity

Traffic

Municipal Corporation

Other
AI Service

Kiro should create

aiService.ts

Functions:

analyzeIssueImage()

↓

call Gemini

↓

parse response

↓

validate JSON

↓

return typed object

Never mix this into React components.

Validation

If Gemini returns invalid JSON

Automatically retry once.

If still invalid

Show

AI couldn't confidently analyze this image.

Please try another image.

Don't crash.

AI Analysis Loading Screen

Instead of

Loading...

Build something memorable.

🤖 CivicLens AI

Analyzing image...

✔ Detecting issue type

✔ Estimating severity

✔ Identifying department

✔ Generating description

Animate each step.

Judges love this.

Expected JSON
{
 "category":"Road Damage",
 "severity":"High",
 "department":"Public Works",
 "title":"Large pothole on main road",
 "description":"A deep pothole is visible in the roadway and could cause accidents or vehicle damage.",
 "confidence":96
}


Testing Checklist

After Step 4, test thoroughly:

Valid image
 Upload a pothole image.
 AI returns valid JSON.
 JSON matches the expected schema.
 No parsing errors.
Different issue types

Try images of:

Garbage
Water leakage
Broken streetlight
Drainage
Traffic signal

Verify that category and department change appropriately.

Invalid image

Upload a random object (e.g., a cup or a pet).

Expected:

 AI still responds gracefully.
 Confidence is lower.
 Category is "Other" if appropriate.
Error handling
 Simulate an API failure.
 Friendly error message appears.
 App does not crash.
 Retry logic works.
Code quality
 No console errors.
 No TypeScript warnings.
 AI logic is isolated from UI.
One enhancement that will impress judges

Instead of showing a generic spinner during analysis, ask Kiro to create a live AI analysis timeline where each analysis stage appears with a small delay and a checkmark animation:

🤖 CivicLens AI is analyzing your image...

✓ Detecting infrastructure type
✓ Estimating severity
✓ Identifying responsible department
✓ Generating report summary

Even if the stages are simulated while waiting for Gemini, this makes the application feel significantly more intelligent and polished, giving users (and judges) a much stronger perception of an AI-powered workflow.



⭐ Step 5 — AI Review & Smart Report Editor

This is NOT just displaying the AI response.

This is where the user collaborates with the AI.

Think of it like GitHub Copilot.

AI suggests.

Human approves.

User Flow
Upload Image

↓

AI Analysis

↓

Suggested Report

↓

User Reviews

↓

User Edits

↓

Approved Report

↓

Next Step
New UI

Replace the placeholder card with an actual AI Review panel.

--------------------------------------------------

🤖 CivicLens AI Suggestions

Confidence

96%

----------------------------------------

Category

[ Road Damage ▼ ]

----------------------------------------

Severity

[ High ▼ ]

----------------------------------------

Department

[ Public Works ▼ ]

----------------------------------------

Title

[ Large pothole on main road ]

----------------------------------------

Description

[ Editable textarea ]

----------------------------------------

✓ AI Generated

Last analyzed just now

--------------------------------------------------

Everything editable.

Confidence Badge

Instead of plain text,

make it visual.

97%

Excellent Confidence

🟢 Green
82%

Good Confidence

🟡 Yellow
55%

Low Confidence

🔴 Red

Please verify.
AI Suggestions Banner

Top of card

🤖

CivicLens AI analyzed your image.

Please review the suggestions before submitting.

Looks professional.

Editable Fields

Every field

must remain editable.

Never lock AI output.

User should be able to edit

Category

Severity

Department

Title

Description

Nice UX

When user edits

show

Edited

small badge.

That tells judges

AI generated

↓

Human improved

Auto Save

Inside React state only.

No Firestore yet.

Every edit

updates

analysisState
Smart Character Counter

Description

156 / 500

Live.

Department Colors

Public Works

Blue

Water Department

Cyan

Sanitation

Green

Electricity

Yellow

Traffic

Orange

Municipal

Purple

Looks polished.

AI Metadata

Bottom of card

Generated by

Gemini AI

Confidence

96%

Analyzed

2 sec ago
Architecture
AI Service

↓

useAIAnalysis()

↓

Analysis Context

↓

AI Review Card

↓

Editable Fields

No logic

inside components.

Testing Checklist

Test these scenarios carefully:

AI Results
 AI-generated values appear correctly.
 Confidence badge changes color based on confidence.
Editing
 Category can be changed.
 Severity can be changed.
 Department can be changed.
 Title can be edited.
 Description can be edited.
 "Edited" badge appears after changes.
Character Counter
 Updates live while typing.
 Handles long descriptions gracefully.
Responsiveness
 Desktop layout.
 Tablet layout.
 Mobile layout.
Theme
 Light mode.
 Dark mode.
Console
 No errors.
 No warnings.
Why this step matters

By the end of Step 5, your app won't just be "AI-powered." It will demonstrate human-in-the-loop AI, which is a much stronger design pattern. Judges appreciate systems where AI assists users but doesn't take away their control.

Once this is complete, we'll move to Step 6: Google Maps Integration, where users can precisely confirm or adjust the issue location before submitting the report. That completes the core report creation experience.


Phase 3 – Step 6: Smart Location Selection (Google Maps)

This isn't just about putting a marker on a map. The location experience should feel intelligent and easy.

Objective

Allow the citizen to accurately specify the issue location before submitting the report.

The user should have multiple ways to set the location:

📍 Use Current Location (browser geolocation)
🔍 Search for an address
🗺️ Drag a marker on the map
📌 Click anywhere on the map
Final User Flow
Image Uploaded
      ↓
AI Analysis
      ↓
Review AI Suggestions
      ↓
Select Location
      ↓
Review Report
      ↓
Submit
Recommended Architecture

Don't put Maps logic inside the page component.

ReportIssuePage
        ↓
LocationCard
        ↓
useLocationPicker()
        ↓
locationService.ts
        ↓
Google Maps API

Create reusable modules because you'll reuse maps later for:

Nearby issues
Issue tracking
Authority dashboard
Analytics
Heatmaps
Files Kiro Should Create
components/location/
    LocationPicker.tsx
    MapContainer.tsx
    AddressSearch.tsx
    CurrentLocationButton.tsx

hooks/
    useLocationPicker.ts

services/
    locationService.ts

types/
    location.ts
Location Card UI

The card should look something like:

📍 Issue Location

────────────────────────────

🔍 Search Address

[________]

OR

📍 Use Current Location

────────────────────────────

🗺️ Interactive Map

(marker)

────────────────────────────

Selected Address

MG Road,
Bengaluru,
Karnataka

Latitude

12.9716

Longitude

77.5946

Accuracy

High
Google Maps Features

Implement:

1. Current Location

One click.

Browser Geolocation API.

Center the map automatically.

2. Search

Google Places Autocomplete.

User types:

MG Road

Suggestions appear.

Select one.

Marker moves.

3. Marker Dragging

User drags marker.

Address updates automatically using reverse geocoding.

4. Click on Map

Click anywhere.

Marker moves.

Coordinates update.

Stored Data

Keep this in React state for now:

{
  latitude: number,
  longitude: number,
  address: string,
  placeId: string,
  source: "gps" | "search" | "manual"
}

This will later be saved with the issue.

User Experience

When the browser asks:

Allow CivicLens AI
to access your location?

If allowed:

Center map
Drop animated marker
Show success toast

If denied:

Don't fail.

Display:

"Location permission denied. You can still search or select the location manually."


Testing Checklist

After Step 6, verify all of these:

Current Location
 Browser permission prompt appears.
 Allowing permission centers the map.
 Marker is placed correctly.
 Coordinates are displayed.
 Address is resolved.
Address Search
 Typing shows suggestions.
 Selecting an address moves the marker.
 Address and coordinates update.
Manual Selection
 Clicking the map moves the marker.
 Dragging the marker updates the address.
 Reverse geocoding works.
Error Handling
 Denying location permission shows a friendly message.
 Invalid search doesn't crash the app.
 Network failures are handled gracefully.
UI & Performance
 Responsive on desktop, tablet, and mobile.
 Light and dark themes look consistent.
 No console errors or warnings.
One recommendation before implementing

Since you're building a portfolio-quality application, I suggest one enhancement beyond the original plan:

After a location is selected, display a small summary card:

📍 Address
🌍 Coordinates
🎯 Source (GPS, Search, or Manual)
✅ Accuracy status

This gives users confidence that the correct location will be submitted and makes the report review experience feel much more polished. After this step, we'll proceed to Step 7: Final Report Assembly & Firestore Submission, where all the information you've gathered (image, AI analysis, edits, and location) comes together into a complete issue report.


⭐ Phase 3 – Step 7: Report Assembly & Firestore Submission

This is the most important backend step because it creates the actual issue record.

Objective

Combine everything collected so far into a single validated report and save it to Firestore.

Inputs include:

Image (base64)
AI analysis
User edits
Location
User information
Timestamps
Final Architecture
ReportIssuePage
        ↓
Review Summary
        ↓
Validate Report
        ↓
useIssueSubmission()
        ↓
issueService.ts
        ↓
Firestore

Notice:

Page contains UI only.
Hook manages submission state.
Service handles Firestore.
Validation occurs before submission.
Firestore Structure

Use this structure from the beginning:

issues/
   issueId

Each document:

{
  "id": "ISS-2026-000123",

  "title": "...",

  "description": "...",

  "category": "Road Damage",

  "severity": "High",

  "department": "Public Works",

  "status": "Pending",

  "imageData": "...",

  "location": {
    "latitude": 12.97,
    "longitude": 77.59,
    "address": "...",
    "source": "gps"
  },

  "ai": {
    "confidence": 96,
    "generated": true,
    "editedFields": ["title"]
  },

  "reporter": {
    "uid": "...",
    "name": "...",
    "email": "..."
  },

  "verification": {
    "upvotes": 0,
    "downvotes": 0
  },

  "timeline": [
    {
      "status": "Pending",
      "timestamp": "...",
      "message": "Issue reported."
    }
  ],

  "createdAt": "...",

  "updatedAt": "..."
}

This structure will support every future feature without migration.

Validation

Before submitting:

Image exists
AI analysis completed
Title present
Description present
Category selected
Severity selected
Department selected
Location selected
User authenticated

Disable the submit button until all validations pass.

Smart Review Screen

Before Firestore submission, show one final review card.

----------------------------------

Report Summary

Photo

Category

Severity

Department

Location

Reporter

Title

Description

----------------------------------

✓ Ready to Submit

Submit Report

----------------------------------

This gives users confidence before they submit.

Issue ID Generation

Instead of random Firestore IDs, generate a readable tracking number.

Example:

CL-2026-000001

or

CIV-000001

Store it in the document and display it to users.

Timeline Initialization

Every issue should start with:

Pending

↓

Reported Successfully

Later phases will append updates.

Testing Checklist
Validation
 Cannot submit without an image.
 Cannot submit without AI analysis.
 Cannot submit without a location.
 Required fields enforce validation.
Firestore
 New document appears in issues.
 Tracking ID is generated.
 Reporter details are correct.
 AI metadata is stored.
 Timeline contains the initial "Pending" entry.
Success Flow
 Success dialog appears.
 Tracking ID is displayed.
 "View Report" navigates correctly (placeholder if needed).
 "Report Another" resets the form.
 "Dashboard" returns to the main page.
Quality
 Desktop, tablet, and mobile layouts verified.
 Light and dark themes verified.
 No console errors.
 No TypeScript warnings.
A portfolio-level enhancement

Instead of storing only editedFields, consider storing both the AI's original suggestions and the final submitted values:

{
  "aiSuggestion": {
    "title": "...",
    "description": "...",
    "category": "...",
    "severity": "...",
    "department": "..."
  },
  "finalSubmission": {
    "title": "...",
    "description": "...",
    "category": "...",
    "severity": "...",
    "department": "..."
  }
}

This showcases human-AI collaboration, which is a compelling design pattern to discuss during interviews and hackathon presentations. It also enables future analytics, such as measuring how often users accept or modify AI suggestions.