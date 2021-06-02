// 递归实现对象的全属性变化侦测
function Observer (obj) {
  Object.keys(obj).map(key => {
      defineReactive(obj, key, obj[key])
  })
}

function defineReactive (data, key, val) {
  if(typeof val === 'object') {
      new Observer(val)
  }
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

function Watcher (data, prop, val, callback) {
  Object.defineProperty(data, prop, {
    enumerable: true,
    configurable: true,
    get: function () {
        return val
    },
    set: function (newVal) {
        console.log('trigger callback');
        callback(newVal)
    }
  })
}

function Dep () {
  this.subs = []
  this.addSub = function (watcher){
    this.subs.push(watcher)
  }
  this.depend = function () {
    if(Dep.target) {
      Dep.target.addDep(this)
      this.addSub(Dep.target)
    }
  }
  this.notify = function (){
    this.subs.forEach(watcher=>watcher.update())
  }
}

function callback (val) {
  const dom = document.querySelector('p')
  dom.innerHTML = val
  console.log("p.innerHTML:",dom.innerHTML)
}

var obj = {a:2,b:1}
new Observer(obj)
new Watcher(obj, 'a', obj.a, callback)

obj.a = obj.b