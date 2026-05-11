# CivicX – AI-Based Smart City Complaint Portal

## Overview

CivicX is an AI-powered Smart City Complaint Management Platform that allows citizens to report civic issues through a chatbot-style interface. The system uses AI to categorize complaints, detect priority levels, and route issues to the appropriate government departments.

The platform also supports realtime updates, maps, department dashboards, and complaint tracking.

---

## Features

### Citizen Side
- Chatbot-based complaint submission
- Image/video upload support
- Location and area-based complaints
- Realtime complaint tracking
- Realtime status updates

### AI Features
- AI complaint categorization
- AI priority detection (Low/Medium/High)
- AI-generated summaries
- Department suggestion

### Government Dashboard
- View all complaints
- Area-wise analytics
- Maps and heatmaps
- Priority monitoring
- Department assignment

### Department Dashboard
- View assigned complaints
- Update complaint status
- Upload repair progress images/videos
- Send realtime updates
- Mark complaints as resolved

---

## Workflow

1. Citizen submits complaint through chatbot UI.
2. Frontend sends complaint data to backend APIs.
3. Backend sends complaint to Claude/Gemini API.
4. AI analyzes complaint and returns:
   - category
   - priority
   - department
5. Backend stores complaint data in MongoDB.
6. Government dashboard monitors and assigns complaints.
7. Department dashboards handle complaint resolution.
8. Socket.IO sends realtime updates to citizen UI.

---

## Realtime Communication

Realtime communication is implemented using Socket.IO.

Features:
- Live complaint updates
- Instant status changes
- Realtime dashboard synchronization
- Progress notifications

---

## Tech Stack

### Frontend
- React.js / Next.js
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Socket.IO

### Database
- MongoDB

### AI Integration
- Claude API / Gemini API

### Maps
- Google Maps API / Mapbox

### Media Storage
- Cloudinary / AWS S3

---

## Architecture

```txt
Citizen Chatbot UI
        ↓
Frontend
        ↓
Backend APIs
        ↓
Claude/Gemini API
        ↓
MongoDB
        ↓
Government Dashboard
        ↓
Department Dashboard
        ↓
Socket.IO Realtime Updates
        ↓
Citizen UI Updates
