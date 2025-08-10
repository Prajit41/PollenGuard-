# PollenGuard - Your Personal Pollen Forecast App

PollenGuard is a modern web application that provides personalized pollen forecasts based on your location. It helps allergy sufferers stay informed about pollen levels and air quality in their area.

## Features

- 🌍 Automatic location detection
- 📱 Responsive design for all devices
- 🌤️ Real-time weather and pollen data
- 📊 Detailed pollen level breakdown
- 📱 PWA support (coming soon)

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- OpenWeather API key (free tier available)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pollen-guard.git
   cd pollen-guard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your OpenWeather API key:
   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in your browser**
   The app should be running at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Icons
- Axios
- OpenWeather API

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
