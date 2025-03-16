export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Represents a JSON object with string keys and JSON values
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Represents a JSON array of JSON values
 */
export type JSONArray = JSONValue[];

/**
 * Represents all serializable JSON data
 */
export type SerializableJSON = JSONValue;
