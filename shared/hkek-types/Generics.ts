export type DictionaryType = { [key: string]: any };

type JSONValue = string | number | boolean | JSONObject | JSONArray | JSONObjectOf<unknown>;

type JSONArray = Array<JSONValue>;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONObjectOf<Type> {
  [x: string]: JSONValue;
}

export type UUID = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;
export type MoneyView = {
  formatted: string;
  value: number;
};
export type Pagination = {
  page: number;
  perPage: number;
};
