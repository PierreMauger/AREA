import { Injectable, Inject } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Action, ActionType, PrismaClient } from '@prisma/client';
import { LinkerService } from 'src/linker/linker.service';
import axios from 'axios';

@Injectable()
export class WeatherService extends BaseService {
  constructor(
    @Inject('Prisma') protected readonly prisma: PrismaClient,
    private readonly linkerService: LinkerService,
  ) {
    super(prisma);
  }
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    let brick = null;
    this.prisma.action
      .findMany({
        where: {
          service: {
            title: 'Weather',
          },
        },
      })
      .then((actions: Action[]) => {
        actions.some(async (action: Action) => {
          if (
            (await this.prisma.brick.findFirst({
              where: { id: action.brickId, active: true },
            })) === null
          ) {
            console.log('brick not active');
          } else if (action.isInput === true) {
            switch (action.actionType) {
              case ActionType.WEATHER_BY_CITY_UP:
                this.action_WEATHER_BY_CITY_UP(action);
                break;
              case ActionType.WEATHER_BY_CITY_DOWN:
                this.action_WEATHER_BY_CITY_DOWN(action);
                break;
            }
          }
        });
      });
  }

  async action_WEATHER_BY_CITY_UP(action: Action) {
    if (action.arguments.length < 2) return;
    let result = null;
    try {
      result = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${action.arguments[0]}&appid=${process.env.OPENWEATHERMAP_API_KEY}&lang=fr`,
      );
    } catch (error) {
      console.log(error.response.data);
      return;
    }
    let { temp, feels_like, temp_min, temp_max, pressure, humidity } =
      result.data.main;
    temp = Math.round((temp - 273.15) * 100) / 100;
    feels_like = Math.round((feels_like - 273.15) * 100) / 100;
    temp_min = Math.round((temp_min - 273.15) * 100) / 100;
    temp_max = Math.round((temp_max - 273.15) * 100) / 100;
    const { description } = result.data.weather[0];
    const { speed } = result.data.wind;
    const { name } = result.data;
    const sunrise = new Date(
      result.data.sys.sunrise * 1000,
    ).toLocaleTimeString();
    const sunset = new Date(result.data.sys.sunset * 1000).toLocaleTimeString();
    console.log(
      `La météo à ${name} est ${description} avec une température de ${temp}°C. La température ressentie est de ${feels_like}°C. La température minimale est de ${temp_min}°C et la température maximale est de ${temp_max}°C. La pression est de ${pressure} hPa et l'humidité est de ${humidity}%. La vitesse du vent est de ${speed} m/s. Le lever du soleil est à ${sunrise} et le coucher du soleil est à ${sunset}.`,
    );
    if (
      temp < Number(action.arguments[1]) &&
      (action.arguments.length < 3 || action.arguments[2] === 'false')
    ) {
      await this.prisma.action.update({
        where: { id: action.id },
        data: {
          arguments: [action.arguments[0], action.arguments[1], 'true'],
        },
      });
    } else if (
      temp >= Number(action.arguments[1]) &&
      (action.arguments.length < 3 || action.arguments[2] === 'true')
    ) {
      await this.prisma.action.update({
        where: { id: action.id },
        data: {
          arguments: [action.arguments[0], action.arguments[1], 'false'],
        },
      });
      this.linkerService.execAllFromAction(
        action,
        [`{TEST_API} Il fait ${temp}°C à ${name}.`],
        this.prisma,
      );
    }
  }

  async action_WEATHER_BY_CITY_DOWN(action: Action) {
    if (action.arguments.length < 2) return;
    let result = null;
    try {
      result = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${action.arguments[0]}&appid=${process.env.OPENWEATHERMAP_API_KEY}&lang=fr`,
      );
    } catch (error) {
      console.log(error.response.data);
      return;
    }
    let { temp, feels_like, temp_min, temp_max, pressure, humidity } =
      result.data.main;
    temp = Math.round((temp - 273.15) * 100) / 100;
    feels_like = Math.round((feels_like - 273.15) * 100) / 100;
    temp_min = Math.round((temp_min - 273.15) * 100) / 100;
    temp_max = Math.round((temp_max - 273.15) * 100) / 100;
    const { description } = result.data.weather[0];
    const { speed } = result.data.wind;
    const { name } = result.data;
    const sunrise = new Date(
      result.data.sys.sunrise * 1000,
    ).toLocaleTimeString();
    const sunset = new Date(result.data.sys.sunset * 1000).toLocaleTimeString();
    console.log(
      `La météo à ${name} est ${description} avec une température de ${temp}°C. La température ressentie est de ${feels_like}°C. La température minimale est de ${temp_min}°C et la température maximale est de ${temp_max}°C. La pression est de ${pressure} hPa et l'humidité est de ${humidity}%. La vitesse du vent est de ${speed} m/s. Le lever du soleil est à ${sunrise} et le coucher du soleil est à ${sunset}.`,
    );
    if (temp <= Number(action.arguments[1]))
      this.linkerService.execAllFromAction(
        action,
        [`{TEST_API} Il fait ${temp}°C à ${name}.`],
        this.prisma,
      );
  }
}
