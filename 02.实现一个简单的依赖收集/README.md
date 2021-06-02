## 实现一个简单的依赖收集

### 1. 如何将侦测的变化和依赖关联起来？

我们可以将依赖抽象理解成一个callback，每次侦测到变化时，触发callback。在callback内部去处理响应变化的逻辑，从而实现数据变化影响的同步。

例如：我希望在obj的a属性变化时，页面的p标签的内容能跟a属性值一起变化。

实现思路：
最直接的思路就是在定义对象属性时就定义好set操作的callback，建立关系，这样在改变值后，相应的callback也会触发。
不过这样弊端太大，需要在定义时列出所有的依赖，且不能后续添加修改。而且代码，耦合过高，功能不够内聚，因此我们做一些调整。

我们将watcher独立出来，并通过一个新的defineProperty()来实现callback的触发。

```js
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

function callback (val) {
  const dom = document.querySelector('p')
  dom.innerHTML = val
  console.log("p.innerHTML:",dom.innerHTML)
}

var obj = {a:2,b:1}
new Observer(obj)
new Watcher(obj, 'a', obj.a, callback)

obj.a = obj.b
```

打印结果：
```
get attr
get attr
trigger callback
p.innerHTML: 1
```
总结：以上我们实现了依赖和变化的关联，完成了属性变化影响的同步处理。

但是，这种方式不够健壮，我们需要手动的绑定这种关联。假如监听属性多，依赖众多时，根本无法投入生产使用。

### 2. 依赖收集中心

我们如果能建立一个专门的依赖收集中心，负责对每个数据依赖进行收集，在setter时通知依赖同步处理，就能解决问题，将它命名为Dep。
```js
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
          dep.depend() // 收集
          return val
      },
      set: function (newVal) {
          if(val === newVal) {
              return
          }
          val = newVal
          console.log('set attr');
          dep.notify() // 通知
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

function initMount () {
  const dom = document.querySelector('p')
  dom.innerHTML = this.a // 此处的值获取，将依赖记录到了dep中
  console.log("p.innerHTML:",dom.innerHTML)
}

var obj = {a:2,b:1}
new Observer(obj)
new Watcher(obj, initMount)

// obj.a = obj.b
```
我们在getter和setter中分别进行依赖的收集和通知（更新处理）。很多同学可能疑惑，其中依赖是如何收集到的呢？

其实核心点在与new Watcher时，内部执行了get方法，内部callback方法的执行逻辑中进行了`this.a`的值读取操作，由于我们使用了call(),callback内部的this是指向data,即我们传入的obj的，`obj.a`这就触发了getter。此时Dep.target还等于watcher的实例，所以此实例便被存入到了subs依赖数组中，也就完成了依赖的收集。
我们只需要等到触发setter的时候，调用subs存入的watcher实例的update方法，便可以触发我们预先定义好的callback回调了!

打印结果
```
get attr
dep append
p.innerHTML: 2
```
并且页面的p标签的内容也是被替换成了2，此时你可以在控制台中改变obj.a的值，相应的p标签的内容也会随之改变！

总结：至此，我们实现了一个简单对象的依赖侦测!

思考与问题：