class WeatherDashboard {
    constructor() {
        // Replace 'YOUR_API_KEY_HERE' with your actual OpenWeatherMap API key
        this.API_KEY = '9a1a8530b907deb307ba097f615fc722';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
        
        this.searchForm = document.getElementById('searchForm');
        this.cityInput = document.getElementById('cityInput');
        this.searchButton = document.getElementById('searchButton');
        this.searchIcon = document.querySelector('.search-icon');
        this.loadingIcon = document.querySelector('.loading-icon');
        
        this.recentSearches = document.getElementById('recentSearches');
        this.recentSearchesList = document.getElementById('recentSearchesList');
        
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        this.weatherCard = document.getElementById('weatherCard');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        
        this.weatherBackground = document.getElementById('weatherBackground');
        
        this.loading = false;
        this.recentSearchesData = this.loadRecentSearches();
        
        this.init();
    }
    
    init() {
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        this.updateRecentSearches();
    }
    
    async handleSearch(e) {
        e.preventDefault();
        const city = this.cityInput.value.trim();
        
        if (!city || this.loading) return;
        
        await this.fetchWeather(city);
    }
    
    async fetchWeather(city) {
        this.setLoading(true);
        this.hideError();
        
        try {
            const response = await fetch(
                `${this.BASE_URL}?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(response.status === 404 ? 'City not found' : 'Failed to fetch weather data');
            }
            
            const data = await response.json();
            const weatherData = this.processWeatherData(data);
            
            this.displayWeather(weatherData);
            this.updateBackground(weatherData.condition);
            this.saveToRecentSearches(city);
            this.hideWelcomeMessage();
            
        } catch (error) {
            this.showError(error.message);
            console.error('Weather API Error:', error);
        } finally {
            this.setLoading(false);
        }
    }
    
    processWeatherData(data) {
        return {
            name: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            feelsLike: Math.round(data.main.feels_like),
            visibility: Math.round(data.visibility / 1000),
            pressure: data.main.pressure,
            icon: data.weather[0].icon,
            condition: data.weather[0].main.toLowerCase()
        };
    }
    
    displayWeather(weather) {
        // Update header
        document.getElementById('cityName').textContent = `${weather.name}, ${weather.country}`;
        document.getElementById('weatherDescription').textContent = weather.description;
        
        // Update main temperature
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        document.getElementById('weatherIcon').alt = weather.description;
        document.getElementById('temperature').textContent = `${weather.temperature}°C`;
        document.getElementById('feelsLike').textContent = `Feels like ${weather.feelsLike}°C`;
        
        // Update weather details
        const detailsContainer = document.getElementById('weatherDetails');
        detailsContainer.innerHTML = '';
        
        const details = [
            { 
                icon: this.createIcon('droplet'), 
                label: 'Humidity', 
                value: `${weather.humidity}%` 
            },
            { 
                icon: this.createIcon('wind'), 
                label: 'Wind Speed', 
                value: `${weather.windSpeed} m/s` 
            },
            { 
                icon: this.createIcon('eye'), 
                label: 'Visibility', 
                value: `${weather.visibility} km` 
            },
            { 
                icon: this.createIcon('gauge'), 
                label: 'Pressure', 
                value: `${weather.pressure} hPa` 
            },
            { 
                icon: this.createIcon('thermometer'), 
                label: 'Feels Like', 
                value: `${weather.feelsLike}°C` 
            },
            { 
                icon: this.createIcon('cloud'), 
                label: 'Condition', 
                value: weather.description 
            }
        ];
        
        details.forEach(detail => {
            const detailElement = this.createWeatherDetail(detail);
            detailsContainer.appendChild(detailElement);
        });
        
        this.weatherCard.classList.remove('hidden');
    }
    
    createWeatherDetail({ icon, label, value }) {
        const detail = document.createElement('div');
        detail.className = 'weather-detail';
        
        detail.innerHTML = `
            <div class="weather-detail-icon">${icon}</div>
            <p class="weather-detail-label">${label}</p>
            <p class="weather-detail-value">${value}</p>
        `;
        
        return detail;
    }
    
    createIcon(type) {
        const icons = {
            droplet: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>',
            wind: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 111.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1011 8H2"/><path d="M12.6 19.4A2 2 0 1014 16H2"/></svg>',
            eye: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
            gauge: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>',
            thermometer: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v10.54a4 4 0 11-4 0V4a2 2 0 014 0z"/></svg>',
            cloud: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 010 9z"/></svg>',
            mapPin: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
        };
        
        return icons[type] || '';
    }
    
    updateBackground(condition) {
        // Remove all weather classes
        this.weatherBackground.className = 'weather-background';
        
        // Add appropriate class based on condition
        const conditionMap = {
            clear: 'clear',
            clouds: 'clouds',
            rain: 'rain',
            drizzle: 'rain',
            thunderstorm: 'thunderstorm',
            snow: 'snow',
            mist: 'mist',
            fog: 'mist',
            haze: 'mist'
        };
        
        const backgroundClass = conditionMap[condition] || 'clear';
        this.weatherBackground.classList.add(backgroundClass);
    }
    
    saveToRecentSearches(city) {
        // Remove if already exists and add to beginning
        this.recentSearchesData = this.recentSearchesData.filter(c => 
            c.toLowerCase() !== city.toLowerCase()
        );
        this.recentSearchesData.unshift(city);
        
        // Keep only last 5 searches
        this.recentSearchesData = this.recentSearchesData.slice(0, 5);
        
        // Save to localStorage
        localStorage.setItem('weatherRecentSearches', JSON.stringify(this.recentSearchesData));
        
        // Update UI
        this.updateRecentSearches();
    }
    
    loadRecentSearches() {
        const saved = localStorage.getItem('weatherRecentSearches');
        return saved ? JSON.parse(saved) : [];
    }
    
    updateRecentSearches() {
        if (this.recentSearchesData.length === 0) {
            this.recentSearches.classList.add('hidden');
            return;
        }
        
        this.recentSearchesList.innerHTML = '';
        
        this.recentSearchesData.forEach(city => {
            const button = document.createElement('button');
            button.className = 'recent-search-item';
            button.innerHTML = `${this.createIcon('mapPin')} ${city}`;
            button.addEventListener('click', () => this.fetchWeather(city));
            this.recentSearchesList.appendChild(button);
        });
        
        this.recentSearches.classList.remove('hidden');
    }
    
    setLoading(isLoading) {
        this.loading = isLoading;
        this.searchButton.disabled = isLoading;
        
        if (isLoading) {
            this.searchIcon.classList.add('hidden');
            this.loadingIcon.classList.remove('hidden');
        } else {
            this.searchIcon.classList.remove('hidden');
            this.loadingIcon.classList.add('hidden');
        }
    }
    
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.weatherCard.classList.add('hidden');
    }
    
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    
    hideWelcomeMessage() {
        this.welcomeMessage.classList.add('hidden');
    }
}

// Initialize the weather dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});
