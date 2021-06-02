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
  const dep = new Dep()
  Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function () {
          console.log('get attr');
          dep.depend()
          return val
      },
      set: function (newVal) {
          if(val === newVal) {
              return
          }
          val = newVal
          console.log('set attr');
          dep.notify()
      }
  })
}

function Watcher (data, callback) {
  this.data = data
  this.callback = callback
  this.deps = []
  
  this.get = function () {
    Dep.target = this
    callback.call(this.data)
    Dep.target = null
  }

  this.get()

  this.update = callback.bind(data)

  // this.addDep = function (dep) {
  //   this.deps.push(dep)
  // }
}

function Dep () {
  this.subs = []
  this.addSub = function (watcher){
    this.subs.push(watcher)
  }
  this.depend = function () {
    if(Dep.target) {
      console.log('dep append')
      this.addSub.call(this,Dep.target)
    }
  }
  this.notify = function (){
    this.subs.forEach(watcher=>watcher.update())
  }
}

function callback () {
  const dom = document.querySelector('p')
  dom.innerHTML = this.a // 此处的值获取，将依赖记录到了dep中
  console.log("p.innerHTML:",dom.innerHTML)
}

var obj = {a:2,b:1}
new Observer(obj)
new Watcher(obj, callback)

// obj.a = obj.b