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
