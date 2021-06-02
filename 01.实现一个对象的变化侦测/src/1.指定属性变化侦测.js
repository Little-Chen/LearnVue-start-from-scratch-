function defineReactive (data, key, val) {
  Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function () {
          console.log('get attr');
          return val
      },
      set: function (newVal) {
          if(val === newVal) {
              return
          }
          val = newVal
          console.log('set attr');
      }
  })
}

var obj = {a:2,b:1}
defineReactive(obj, 'a', obj.a)

obj.a = obj.b