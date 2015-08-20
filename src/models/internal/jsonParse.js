
var mapValueToType = function(rawValue, type) {
  var initialValue = null;

  if (typeof type === 'object') {
    if (type) {
      if (type instanceof Array) {
        var innerType = type[0];

        if (rawValue !== null && rawValue !== undefined) {
          initialValue = rawValue.map( v => {
            try {
              return mapValueToType(v, innerType);
            }
            catch(e) {
              console.log(e);
              return v;
            }
          });
        }
      }
      else {
        if (type.mapper && typeof type.mapper === 'function') {
          initialValue = (rawValue !== null && rawValue !== undefined) ? type.mapper(rawValue) : null;
        }
      }
    }
  }
  else if (type === String) {
    initialValue = (rawValue !== null && rawValue !== undefined) ? String(rawValue) : null;
  }
  else if (type === Number) {
    initialValue = (rawValue !== null && rawValue !== undefined) ? Number(rawValue) : null;

    if (Number.isNaN(initialValue)) {
      initialValue = null;
    }
  }
  else if (type === Boolean) {
    initialValue = (rawValue !== null && rawValue !== undefined) ? Boolean(rawValue) : null;
  }
  else if (type === Object) {
    initialValue = rawValue || null;
  }
  else if (type === Date) {
    initialValue = new Date(rawValue * 1000);

    if(isNaN(initialValue)) {
      initialValue = null;
    }
    else if(initialValue === 'Invalid Date') {
      initialValue = null;
    }
    else{
      initialValue = new Date(initialValue.valueOf() + initialValue.getTimezoneOffset() * 60000);
    }
  }
  else if (typeof type === 'function') {
    initialValue = (rawValue !== null && rawValue !== undefined) ? new type(rawValue) : null;
  }

  return initialValue;
};

var setPropertyFromArgs = function(args, obj, name, type, optional, merge) {
  if (!obj[name]) {
    var rawValue = args[name];
    var convertedValue = mapValueToType(rawValue, type);

    if (!optional && !convertedValue) {
      throw TypeError('non-optional field `' + name + '` found null value. Args:', args);
    }

    if (convertedValue) {
      if (merge) {
        obj[name] = convertedValue;
      }
      else {
        Object.defineProperty(obj, name, {
          configurable: false,
          enumerable:   true,
          writable:     true,
          value:        convertedValue
        });
      }
    }
  }
};

var jsonParseArgs = function(args, obj, merge) {
  var properties = obj.jsonProperties;
  for (var name in properties) {
    if(properties.hasOwnProperty(name)) {
      var value = properties[name];

      var optional = true;
      var type;
      if (typeof value === 'object') {
        if (value.type !== undefined) {
          type = value.type;
        }
        else if (value.mapper !== undefined) {
          type = value;
        }
        else if (value instanceof Array) {
          type = value;
        }

        if (value.optional !== undefined) {
          optional = value.optional;
        }
      }
      else {
        type = value;
      }

      setPropertyFromArgs(args, obj, name, type, optional, merge);
    }
  }
};

export var jsonCreateWithArgs = function(args, obj) {
  jsonParseArgs(args, obj, false);
};

export var jsonMergeWithArgs = function(args, obj) {
  jsonParseArgs(args, obj, true);
};

export var jsonCreateFromArrayData = function(arr, type) {
  return mapValueToType(arr, type);
};
