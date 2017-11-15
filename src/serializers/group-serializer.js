function toJson(obj) {
  if (obj.toJSON) {
    return obj.toJSON();
  }
  return obj;
}

export default function serializer(obj) {
  if (Array.isArray(obj)) {
    return {
      data: obj.map(toJson),
    };
  }
  return {
    data: toJson(obj),
  };
}
