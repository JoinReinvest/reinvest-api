export type DictionaryType = { [key: string]: any };

type JSONValue = string | number | boolean | JSONObject | JSONArray;

interface JSONArray extends Array<JSONValue> {}

export interface JSONObject {
  [x: string]: JSONValue;
}
