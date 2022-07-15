import axios from "axios";

const OPEN_WEATHER_API = "https://api.openweathermap.org/data/2.5";
const OPEN_WEATHER_GEO_API = "http://api.openweathermap.org/geo/1.0";
const OPEN_WEATHER_KEY = "855818493a3a3b064c5c75a7dab35552";

export default {
  async getWeather(payload) {
    const res = await axios.get(
      `${OPEN_WEATHER_API}/weather?lat=${payload.lat}&lon=${payload.lon}&units=metric&appid=${OPEN_WEATHER_KEY}`
    );
    return res.data;
  },

  async getWeekWeather(payload) {
    const res = await axios.get(
      `${OPEN_WEATHER_API}/onecall?lat=${payload.lat}&lon=${payload.lon}&units=metric&appid=${OPEN_WEATHER_KEY}`
    );
    return res.data;
  },

  getCoordinates(payload) {
    return axios.get(
      `${OPEN_WEATHER_GEO_API}/direct?q=${payload.city},${payload.state},${payload.country}&appid=${OPEN_WEATHER_KEY}`
    );
  },
};
