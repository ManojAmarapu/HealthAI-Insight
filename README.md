HealthAI Insight

🔗 Live Demo: https://healthai-insight.vercel.app

HealthAI Insight is a production-ready frontend application that simulates an intelligent health assistance system using a strictly-typed, modular React architecture.

The project demonstrates client-side intelligence, structured service abstraction, real-time analytics computation, and performance-optimized UI design.

🧠 System Overview

HealthAI Insight is built around four core modules:

🩺 Symptom Intelligence Engine

Implements a weighted scoring algorithm to evaluate user-provided symptoms and generate:

Top 3 probable conditions

Confidence percentages

Risk categorization (Low / Medium / High)

Persistent consultation history

The scoring model prioritizes symptom relevance and condition weight mapping to simulate real-world diagnostic ranking.

📊 Health Analytics Dashboard

Transforms consultation history into actionable insights:

Total consultations tracking

Risk distribution visualization

Most common condition analysis

Monthly trend computation

All analytics are computed dynamically from persisted client-side data.

💬 Smart Health Chat

An interactive assistant interface with:

Persistent chat history

Keyword-based urgency detection

High-risk alert banners

Structured response formatting

Designed to simulate triage-style guidance logic.

💊 Structured Treatment Guide

Provides organized treatment suggestions and guidance while maintaining strict separation between UI and business logic.

🏗 Engineering Approach

This project was intentionally structured to reflect scalable frontend system design:

Strict TypeScript configuration

Feature-based modular architecture

Dedicated service layer for business logic

UI and logic separation

Local persistence abstraction

Route-based code splitting

Memoized components for render optimization

Clean reusable component system

The goal was not only functionality, but architectural clarity and maintainability.

⚙️ Tech Stack

React

Vite

TypeScript (Strict Mode)

Tailwind CSS

shadcn/ui

Recharts

Vercel (Deployment)

🎯 What This Project Demonstrates

Frontend architectural thinking

Algorithm implementation in client-side systems

Data modeling & persistence strategies

Real-time derived analytics

Performance optimization techniques

Production deployment workflow

👤 Author

Manoj Amarapu
B.Tech Computer Science & Engineering
