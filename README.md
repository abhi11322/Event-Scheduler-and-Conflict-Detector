# 🗓️ Event Scheduler and Conflict Detector

---

## 📘 Project Overview

The **Event Scheduler and Conflict Detector** is a single-page web application that helps users manage their daily schedules visually and efficiently.  
It includes a dynamic timeline where users can quickly schedule events, detect time conflicts, and stay within defined working hours.  
The interface is clean, responsive, and built using **Tailwind CSS**.

---

## 🚀Deployment

https://abhi11322.github.io/Event-Scheduler-and-Conflict-Detector/

---

## ✨ Features

- **Customizable Working Hours**  
  Define your daily start and end working times.

- **Event Scheduling**  
  Add new events with a description, start time, and end time.

- **Real-time Conflict Detection**  
  The system automatically checks for overlapping events and highlights conflicts visually.

- **Interactive Timeline**  
  Events are displayed dynamically on a timeline scaled according to your working hours.

- **Drag-and-Drop Adjustment**  
  Drag event blocks vertically on the timeline to adjust start and end times instantly.  
  The conflict detection algorithm updates in real-time.

---

## 🗂️ File Structure

```
/event-scheduler-conflict-detector
│
├── index.html     # Main structure of the app, includes Tailwind CSS and links to app.js
├── app.js         # Handles logic: event creation, timeline rendering, conflict detection
└── styles.css     # (Optional) Custom styles beyond Tailwind (minimal usage)
```

---

## 🚀 How to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/event-scheduler-conflict-detector.git
   cd event-scheduler-conflict-detector
   ```

2. **Set up files**
   - Save the provided HTML as `index.html`
   - Create and fill in `app.js`
   - (Optional) Add `styles.css` for additional styling

3. **Run the app**
   - Open `index.html` in any modern browser

---

## 💡 Usage Guide

### 1️⃣ Set Working Hours
Use the **Settings & Status** panel to set your daily working start and end times.  
Click **Update Working Hours** — this defines the visible range of your timeline.

### 2️⃣ Add an Event
Use the **Add New Event** form to enter a description, start time, and end time.  
Click **Schedule Event** to add it.

### 3️⃣ Check for Conflicts
If a new event overlaps with an existing one:
- A warning appears in the **Status** section.
- Conflicting events are visually highlighted (e.g., red border).

### 4️⃣ Adjust Events
Drag and drop event blocks vertically on the timeline to modify their times.  
Conflict detection runs automatically after every change.

---

## 🧠 Tech Stack

- **Frontend:** HTML, Tailwind CSS  
- **Logic:** JavaScript (Vanilla)  
- **Design:** Responsive layout using Tailwind utility classes

---

## 🔮 Future Enhancements

- Persistent storage using LocalStorage or IndexedDB  
- Multi-day or weekly timeline support  
- Dark mode option  
- Export schedules as PDF or image  

---

## 📄 Screenshot

<img width="1143" height="850" alt="image" src="https://github.com/user-attachments/assets/6cd49204-488f-4c73-9f10-d2d46d1e7ad9" />

---

## 👨‍💻 Developer

**Abhishek Poovaiah M**  
📧 Email: *abhishekpoovaiah113@gmail.com*  
🕒 Date: *October 20, 2025*
