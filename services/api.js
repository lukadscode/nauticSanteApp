import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {EXPO_PUBLIC_API_URL} from "./env";

const API = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  "Access-Control-Allow-Origin": "*", // Ajout temporaire
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    if (err?.response?.status === 401 && !err.config._retry) {
      console.log("Refreshing token on 401");
      err.config._retry = true;
      if (!(await AsyncStorage.getItem('isRefreshing') === 'yes')) {
        await AsyncStorage.setItem('isRefreshing', 'yes')

        return new Promise(async (resolve, reject) => {
          console.log("refreshing token");
          try {
            const jwt = (await axios.post(EXPO_PUBLIC_API_URL + "/auth/local/refresh", {
              refreshToken: await AsyncStorage.getItem("refreshToken"),
            })).data.jwt
            await AsyncStorage.setItem('userToken', jwt)
            resolve(axios(err.config));

          } catch (error) {
            //TODO redirect to login, refreshToken invalidated
            console.log('redirect to login')
          }

          await AsyncStorage.setItem('isRefreshing', 'no')

        });
      } else {
        // not the first request, wait for first request to finish
        return new Promise((resolve, reject) => {
          const intervalId = setInterval(async () => {
            console.log("refresh token - waiting");
            if (!(await AsyncStorage.getItem('isRefreshing') === 'yes')) {
              clearInterval(intervalId);
              console.log("refresh token - waiting resolved", err.config);
              resolve(axios(err.config));
            }
          }, 100);
        });
      }
    }

    console.error(err.request.responseURL, err)

    return Promise.reject(err);
  }
);

export default API;
