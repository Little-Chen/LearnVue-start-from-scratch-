## 实现一个数组的变化侦测

### 1. 数组的变化方式

变化侦测的核心是通过defineProperty的getter和setter实现。但是数组还可以通过push()、pop()、shift()、unshift()、splice()、sort()、reverse()等方法来实现对数组的修改，这些方式显然不会触发getter和setter

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