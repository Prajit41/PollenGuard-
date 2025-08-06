# Smart Allergy Forecast App

A modern, responsive web application that provides real-time allergy forecasts based on weather and pollen data. The app helps users with allergies plan their day by showing current and forecasted pollen levels, weather conditions, and personalized allergy risk assessments.

## Features

- 🌡️ Real-time weather data
- 🌾 Pollen level forecasts
- 📊 Interactive charts for pollen trends
- 📱 Responsive design for all devices
- 📍 Automatic location detection
- 🤖 AI-powered allergy insights

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/smart-allergy-forecast-app.git
   cd smart-allergy-forecast-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

### Building for Production

To create a production build:

```bash
npm run build
```

### Deployment

This app is designed to be deployed to GitHub Pages. To deploy:

1. Update the `homepage` field in `package.json` with your GitHub Pages URL.
2. Run the build:
   ```bash
   npm run build
   ```
3. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Configuration

Create a `.env` file in the root directory and add your API keys:

```
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_AMBEE_API_KEY=your_ambee_api_key
```

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- [Vite](https://vitejs.dev/) - Build tool
- [Chart.js](https://www.chartjs.org/) - Interactive charts
- [date-fns](https://date-fns.org/) - Date utility library
- [OpenWeatherMap API](https://openweathermap.org/api) - Weather data
- [Ambee API](https://api-docs.getambee.com/) - Pollen data

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
