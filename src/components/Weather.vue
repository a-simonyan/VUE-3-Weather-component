<template>
  <div>
    <div class="weather-component__inputs">
      <div
        class="d-flex weather-component__inputs--wrapper"
        style="gap: 0 20px"
      >
        <div class="d-flex flex-column">
          <label for="city">Write city name <span>*</span></label>
          <input name="city" type="text" v-model="placeData.city" />
        </div>

        <div class="d-flex flex-column">
          <label for="state">Write state name</label>
          <input name="state" type="text" v-model="placeData.state" />
        </div>

        <div class="d-flex flex-column">
          <label for="country">Write country name <span>*</span></label>
          <input name="country" type="text" v-model="placeData.country" />
        </div>
      </div>

      <button
        type="button"
        @click="handleSearchPlace"
        :disabled="v$.placeData.$invalid || loading"
      >
        Search
      </button>
    </div>
    <div class="d-flex flex-column weather-component">
      <div class="weather-component__wrapper" v-if="model">
        <div class="current-weather d-flex align-center justify-space-between">
          <div class="d-flex align-center fill-height">
            <div
              class="current-weather__icon"
              v-bind:style="{
                backgroundImage: 'url(' + currentWeatherIcon + ')',
              }"
            ></div>
            <div class="d-flex flex-column align-center">
              <div class="current-weather__now">
                <div class="d-flex align-start">
                  <h2>{{ currentTemp }}</h2>
                  <span>&#8451;</span>
                </div>
              </div>
              <span class="current-weather__minmax"
                >{{ currentTempMin }}&#176; / {{ currentTempMax }}&#176;</span
              >
            </div>
            <button
              class="extra-data-btn"
              @click="showExtraData = !showExtraData"
            >
              Show Extra Data
            </button>
            <div class="d-flex align-center" v-show="showExtraData">
              <div
                class="d-flex flex-column fill-height justify-space-between current-weather__info"
              >
                <div class="d-flex align-center current-weather__info-wrapper">
                  <img src="@/assets/pressure.svg" alt="pressure icon" />
                  <span>Pressure:&nbsp;</span>
                  <b>{{ model.main.pressure }} hPa</b>
                </div>
                <div class="d-flex align-center current-weather__info-wrapper">
                  <img src="@/assets/humidity.svg" alt="humidity icon" />
                  <span>Humidity:&nbsp;</span><b>{{ model.main.humidity }}%</b>
                </div>
                <div class="d-flex align-center current-weather__info-wrapper">
                  <img src="@/assets/wind.svg" alt="wind icon" />
                  <span>Wind:&nbsp;</span><b>{{ model.wind.speed }} m/s N</b>
                </div>
              </div>
              <div
                class="d-flex align-center flex-column current-weather__info--sunrise"
              >
                <p>
                  Sunrise:
                  <strong>{{ getSunTime(model.sys.sunrise) }}</strong>
                </p>
                <p>
                  Sunset: <strong>{{ getSunTime(model.sys.sunset) }}</strong>
                </p>
              </div>
            </div>
          </div>

          <div class="d-flex">
            <div
              class="d-flex align-end flex-column justify-space-between fill-height"
            >
              <div class="weather-component__country">
                {{ model.name }}, {{ model.sys.country }}
              </div>
              <div class="weather-component__time">
                {{ currentDate }}
              </div>
              <div class="weather-component__weather">
                {{ model.weather[0].main }}
              </div>
            </div>

            <div
              class="weather-component__arrow d-flex justify-center align-center"
              :class="{ rotated: isExpanded }"
            >
              <img
                src="@/assets/arrow-down.png"
                alt=""
                width="40"
                height="20"
                @click="onExpand"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="weather-component__no-data" v-else>No data were found</div>

      <div v-if="isExpanded && weekModel" class="weather-component__week">
        <div
          class="weekly-weather d-flex flex-column align-center"
          v-for="(item, index) in weekModel.daily"
          :key="index"
        >
          <div
            class="weekly-weather__wrapper d-flex flex-column align-center"
            @click="onSelectDay(item)"
          >
            <div class="weekly-weather__day">{{ getDay(item.dt) }}</div>
            <div
              class="weekly-weather__icon"
              v-bind:style="{
                backgroundImage:
                  'url(' + getDayIcon(item.weather[0].icon) + ')',
              }"
            ></div>
            <div
              class="weekly-weather__minmax"
              v-html="getDayMinMax(item.temp.min, item.temp.max)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/service.js";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

export default {
  setup() {
    return { v$: useVuelidate() };
  },
  validations() {
    return {
      placeData: {
        city: { required },
        // I made the state optional because the user can get data without state.
        country: { required },
      },
    };
  },
  name: "WeatherComponent",
  data() {
    return {
      model: null,
      weekModel: null,
      isExpanded: false,
      showExtraData: false,
      selectedDay: null,
      loading: false,
      lat: null,
      lon: null,
      placeData: {
        city: "",
        state: "",
        country: "",
      },
    };
  },
  computed: {
    currentDate() {
      const mL = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const date = new Date(this.model.dt * 1000);
      let day = date.getDate();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      if (hours < 10) hours = "0" + hours;
      if (minutes < 10) minutes = "0" + minutes;
      return `${mL[date.getMonth()]} ${day} | ${hours}:${minutes}`;
    },
    currentWeatherIcon() {
      return `http://openweathermap.org/img/wn/${this.model?.weather[0]?.icon}@2x.png`;
    },
    currentTemp() {
      return Math.round(this.model.main.temp);
    },
    currentTempMin() {
      return Math.round(this.model.main.temp_min);
    },
    currentTempMax() {
      return Math.round(this.model.main.temp_max);
    },
  },
  methods: {
    async onExpand() {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded && !this.weekModel) {
        this.weekModel = await service.getWeekWeather({
          lat: this.lat,
          lon: this.lon,
        });
      }
    },
    onSelectDay(item) {
      this.model = {
        ...this.model,
        weather: item.weather,
        main: {
          temp: item.temp.day,
          feels_like: item.feels_like.day,
          temp_min: item.temp.min,
          temp_max: item.temp.max,
          pressure: item.pressure,
          humidity: item.humidity,
        },
        wind: {
          speed: item.wind_speed,
          deg: item.wind_deg,
        },
        dt: item.dt,
      };
    },
    getDay(dt) {
      var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const date = new Date(dt * 1000);
      return `${days[date.getDay()]}`;
    },
    getDayIcon(icon) {
      return `http://openweathermap.org/img/wn/${icon}@2x.png`;
    },
    getDayMinMax(min, max) {
      return `${Math.round(min)}&#176;/${Math.round(max)}&#176;`;
    },
    handleSearchPlace() {
      this.loading = true;
      const placeData = service.getCoordinates(this.placeData);
      placeData
        .then(async (res) => {
          if (res.data.length) {
            const payload = {
              lat: res.data[0].lat.toFixed(4),
              lon: res.data[0].lon.toFixed(4),
            };
            this.model = await service.getWeather(payload);
          } else this.model = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getSunTime(time) {
      var date = new Date(time * 1000);
      var timestr = date.toLocaleTimeString();
      return timestr;
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    async showPosition(position) {
      this.lat = position.coords.latitude.toFixed(4);
      this.lon = position.coords.longitude.toFixed(4);

      this.model = await service.getWeather({ lat: this.lat, lon: this.lon });
      this.placeData.city = this.model.name;
      this.placeData.country = this.model.sys.country;
    },
  },
  created() {
    this.getLocation();
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;1,700&display=swap");

.weather-component {
  font-family: "Noto Sans";
  background: #fafafa;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  width: 100%;

  &__wrapper {
    width: 100%;
    padding: 22px 0px;
  }

  &__inputs {
    width: max-content;
    margin: 0 auto 40px;
    display: flex;
    flex-direction: column;
    gap: 20px 0;
    label {
      margin-bottom: 8px;
    }
    span {
      color: red;
    }
    @media (max-width: 1024px) {
      &--wrapper {
        flex-direction: column;
        width: 100%;
        margin: 0;
      }
      label {
        margin-bottom: 8px;
      }
      input {
        margin-bottom: 12px;
      }
    }

    input {
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgb(255, 136, 0);
      padding: 0 16px;
      font-size: 20px;
      outline: none;
      &:active,
      &:focus {
        outline: none;
        border-color: rgb(196, 114, 20);
      }
    }
    button {
      width: 50%;
      margin: 0 auto;
      height: 40px;
      border-radius: 10px;
      border: none;
      background-color: rgb(255, 136, 0);
      cursor: pointer;
      font-size: 18px;
      &:hover {
        background-color: rgb(196, 114, 20);
      }
      &:disabled {
        background-color: silver;
        cursor: auto;
      }
    }
  }

  &__week {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    border-top: 1px solid #e6e6e6;
    padding: 30px 0 50px;

    .weekly-weather {
      &__wrapper {
        width: 136px;
        border-radius: 10px;
        cursor: pointer;

        &:hover {
          background-color: rgba(203, 32, 40, 0.2);
        }
      }

      &:not(:last-child) {
        border-right: 1px solid #c4c4c4;
      }

      &__day {
        font-size: 20px;
      }

      &__icon {
        width: 70px;
        height: 50px;
        background-position: center;
        margin: 10px 0;
      }

      &__minmax {
        font-size: 24px;
        color: #cb2028;
      }
    }
  }

  .current-weather {
    height: 80px;

    &__icon {
      width: 70px;
      height: 70px;
      background-position: center;
      margin-right: 15px;
    }

    &__now {
      text-align: center;

      h2 {
        font-style: normal;
        font-weight: normal;
        font-size: 48px;
        line-height: 1px;
      }

      span {
        font-style: normal;
        font-weight: normal;
        font-size: 25px;
      }
    }

    &__minmax {
      font-size: 16px;
      // margin-bottom: 40px;
    }

    &__info {
      padding-left: 20px;
      margin-left: 20px;
      border-left: 1px solid #77777791;
      &--sunrise {
        margin-left: 40px;
        p {
          margin: 5px;
        }
      }

      &-wrapper {
        font-size: 14px;
        margin-bottom: 10px;

        span {
          color: #777777;
        }
      }
      img {
        height: 15px;
        width: 15px;
        margin-right: 12px;
      }
    }
  }

  &__country {
    font-weight: 500;
    font-size: 24px;
    line-height: 33px;
    color: #cb2028;
  }

  &__time {
    font-size: 16px;
    line-height: 22px;
    color: #777777;
  }

  &__weather {
    font-size: 18px;
    line-height: 25px;
    font-style: italic;
  }

  &__arrow {
    cursor: pointer;
    margin-left: 30px;
    &.rotated {
      transform: rotate(180deg);
    }
  }

  .fill-height {
    height: 100%;
  }
  &__no-data {
    padding: 40px;
  }
}
.extra-data-btn {
  width: 150px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: rgb(255, 136, 0);
  font-size: 14px;
  margin-left: 40px;
  &:hover {
    background-color: rgb(196, 114, 20);
  }
  &:active {
    background-color: rgb(160, 94, 19);
  }
}

.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.fill-height {
  height: 100%;
}
.align-center {
  align-items: center;
}
.align-start {
  align-items: flex-start;
}
.justify-space-between {
  justify-content: space-between;
}
.justify-center {
  justify-content: center;
}
</style>
