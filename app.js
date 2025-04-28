
const apiKey = "1637f9c508mshbc4a4f878c1e5dfp1cf3aejsn279518c8dd49"; // Replace with valid key if needed
let isCelsius = true;

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

function applyStoredTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
}

function applyTimeBasedTheme() {
  const hour = new Date().getHours();
  document.body.classList.remove("morning", "afternoon", "evening", "night");

  if (hour >= 5 && hour < 12) {
    document.body.classList.add("morning");
  } else if (hour >= 12 && hour < 17) {
    document.body.classList.add("afternoon");
  } else if (hour >= 17 && hour < 20) {
    document.body.classList.add("evening");
  } else {
    document.body.classList.add("night");
  }
}

async function getWeather(cityName = null) {
  const city = cityName || document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(city)}&days=1`;

  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    const temp = isCelsius ? data.current.temp_c : data.current.temp_f;
    const unit = isCelsius ? "°C" : "°F";

    const iconUrl = "https:" + data.current.condition.icon;
    const conditionText = data.current.condition.text;

    document.getElementById("weatherResult").innerHTML = `
  <div class="card mx-auto mt-4" style="max-width: 400px;">
    <h3>${data.location.name}, ${data.location.country}</h3>
    <p><img src="${iconUrl}" alt="${conditionText}" /> ${conditionText}</p>
    <p>Temperature: ${temp}${unit}</p>
    <p>Humidity: ${data.current.humidity}%</p>
    <p>Wind: ${data.current.wind_kph} km/h</p>
    <p>Pressure: ${data.current.pressure_mb} mb</p>
    <p>Sunrise: ${data.forecast.forecastday[0].astro.sunrise}</p>
    <p>Sunset: ${data.forecast.forecastday[0].astro.sunset}</p>
  </div>
`;
  } catch (err) {
    console.error("Weather Fetch Error:", err);
    alert("❌ Unable to fetch weather. Reason: " + err.message);
    document.getElementById("weatherResult").innerHTML = `<div class="alert alert-danger">Failed to fetch weather data.</div>`;
  }
}

function toggleUnit() {
  isCelsius = !isCelsius;
  getWeather(); // refresh with new unit
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${latitude},${longitude}&days=1`;
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
      };
      try {
        const res = await fetch(url, options);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        getWeather(data.location.name);
      } catch (err) {
        console.error("Location Weather Error:", err);
        alert("❌ Failed to fetch weather for your location. " + err.message);
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function speakWeather() {
  const result = document.getElementById("weatherResult").innerText;
  if (!result) return alert("Please get the weather first!");
  const msg = new SpeechSynthesisUtterance(result);
  speechSynthesis.speak(msg);
}

function startVoiceSearch() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    document.getElementById("cityInput").value = city;
    getWeather(city);
  };

  recognition.onerror = () => {
    alert("❌ Voice recognition failed. Please try again.");
  };
}

function saveCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Enter a city to save.");
  let saved = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!saved.includes(city)) {
    saved.push(city);
    localStorage.setItem("favorites", JSON.stringify(saved));
    alert(`${city} added to favorites!`);
    showSavedCities();
  } else {
    alert(`${city} is already in favorites.`);
  }
}

function showSavedCities() {
  const favDiv = document.getElementById("favoriteCities");
  const saved = JSON.parse(localStorage.getItem("favorites")) || [];

  favDiv.innerHTML = saved.length ? "<h4>Your Favorite Cities:</h4>" : "";
  saved.forEach((city) => {
    favDiv.innerHTML += `<button class="btn btn-outline-primary m-1" onclick="getWeather('${city}')">${city}</button>`;
  });
}

// INIT
applyStoredTheme();
applyTimeBasedTheme();
showSavedCities();
