# PrintQueue: A Web-Based Smart Print Queue Management System

A full-stack web application designed to eliminate long waiting times and crowding at campus stationery shops by enabling remote PDF uploads, automated page counting, transparent pricing, and live queue tracking[cite: 2].

## 🚀 Features

- **Remote Document Upload:** Students can upload PDF documents from anywhere on or off campus[cite: 2].
- **Automatic Page Detection & Pricing:** Automatically detects page counts and calculates total costs based on color/B&W rates and binding options[cite: 2].
- **Flexible Payments:** Supports digital UPI/GPay/PhonePe payments as well as Cash on Pick Up[cite: 2].
- **Live Stationer Dashboard:** Real-time summary counters (*Total Received*, *Pending Queue*, *Currently Printing*, *Ready for Pickup*) with one-click status updates[cite: 2].
- **Order History:** Personal student view tracking active and completed print requests[cite: 2].

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router, HTML5, CSS3, Tailwind CSS[cite: 2]
- **Backend:** FastAPI, Python, SQLAlchemy ORM, Pydantic[cite: 2]
- **Database & Storage:** Relational Database (PostgreSQL / SQLite), Local File System Storage[cite: 2]

## 📂 Project Structure

- `frontend/` — React single-page application and UI components[cite: 2]
- `backend/` — FastAPI REST API routers, database models, and business logic services[cite: 2]
- `uploads/` — Secure directory for storing incoming print job documents[cite: 2]
