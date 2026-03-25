# Page Replacement Algorithms Visualizer

A modern, interactive web application that visually simulates Page Replacement Algorithms (FIFO, LRU, Optimal) used in Operating Systems.

## 🚀 Live Simulation
Built with **React**, **Tailwind CSS v4**, **Framer Motion**, and **Recharts**.

## ✨ Features

- **Interactive Visualizer**: Watch memory frames update in real-time as pages are requested.
- **Three Algorithms**: Compare **FIFO** (First-In-First-Out), **LRU** (Least Recently Used), and **Optimal** replacement strategies.
- **Dynamic Controls**: 
  - Play / Pause / Reset simulation.
  - Step Forward / Backward.
  - Variable speed control.
  - Random reference string generator.
- **Performance Analysis**:
  - Real-time counters for Page Faults and Page Hits.
  - Bar Charts for algorithm performance comparison.
  - Line Charts for fault progression tracking.
- **Premium UI**: Clean dark/light mode toggle with smooth animations.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/k4vy06/OS-Page-Replacement-Algorithms-Visualizer.git
   cd OS-Page-Replacement-Algorithms-Visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📜 Algorithms Explanation

- **FIFO**: Replaces the oldest page in memory (the one that entered first).
- **LRU**: Replaces the page that has not been used for the longest period of time.
- **Optimal**: Replaces the page that will not be used for the farthest time in the future (requires knowledge of future requests).

---
Developed for OS Simulation Project.
