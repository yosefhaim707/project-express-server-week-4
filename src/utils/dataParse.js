export const parseJsonToObject = (json) => {
  return JSON.parse(json);
};

export const parseObjectToJson = (object) => {
  return `${JSON.stringify(object, null, 2)}\n`;
};
