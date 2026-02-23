

# Keep It Reet — Pro Rides Management System

Rebuild the existing "Keep It Reet" drift event ride management app as a proper React application with a real database backend, keeping the signature dark motorsport aesthetic (black, magenta #FF006E, cyan #00F0FF).

## Design & Branding
- Dark theme with magenta/cyan gradient accents, matching the existing look
- Bebas Neue + Oswald + Inter font stack
- Glowing card borders, gradient buttons, diagonal stripe background effects
- Fully mobile-responsive for field staff using phones/tablets at events

## Backend — Lovable Cloud (Supabase)
Replace localStorage with a real database so 5-20 staff can collaborate in real-time:
- **Database tables**: Drivers, Events, Customers/Waitlist, Ride Submissions
- **Staff authentication**: Simple sign-in (name-based, matching current flow)
- **Real-time subscriptions**: When a customer joins the waitlist or a ride is logged, all staff see it instantly — no more 5-second polling

## Page 1: Customer Waiting List Sign-Up (`/join`)
- Public-facing form: First Name, Last Name, Phone, Email, Age Group
- Success confirmation screen with "Add Another Person" option
- Mobile-first design with large touch targets
- Shareable link / QR code for event attendees

## Page 2: Staff Dashboard (`/`)
Seven tabs matching the current app:

### 🏁 Book a Ride
- Select current event from dropdown
- Pick customer from waiting list or enter new details
- Assign a driver (name + car)
- Add optional notes, then log the ride

### 📋 Waiting List
- Live view of all customer registrations with status (Waiting / Booked)
- Mark as booked or remove customers
- Customer sign-up link display with copy button
- Auto-updates in real-time when new customers register

### 📡 Live Feed
- Chronological log of all ride bookings
- Shows customer → driver assignment, event, staff member, and notes

### 📊 Stats
- Summary cards: Total Rides, Unique Customers, Active Drivers, Waiting List count

### 🚗 Driver Leaderboard
- Ranked list of drivers by total rides given
- Shows driver name, car, and ride count

### 👥 Customer Tracker
- All customers with ride history and repeat ride counts

### ⚙️ Admin Panel
- **Driver management**: Add/remove drivers manually, or upload from Excel/CSV
- **Customer upload**: Bulk import customers to waiting list from Excel/CSV
- **Event management**: Add/remove events
- **Data management**: Export rides as CSV, clear rides, full system reset

## Excel/CSV Upload Support
- Upload drivers (Name, Car columns) and customers (First Name, Last Name, Phone, Email, Age Group)
- Preview imported data before saving
- Validation and duplicate detection

## Pre-loaded Data
- 18 default drivers (Scott Massari, Anth Romano, etc. with their cars)
- 6 default events (Friday Night Drifts, Drift School, Reetsuri Festival, etc.)

