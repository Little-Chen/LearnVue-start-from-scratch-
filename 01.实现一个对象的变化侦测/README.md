## 实现一个简单对象的变化侦测

### 1. 实现对象指定属性的变化侦测

技术重点：`Object.definePorperty()`
```js
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
```

打印结果：
```
set attr
```
总结：因为我们只使用`defineProperty()`重新定义了`a`属性，所以只侦测到了a的set操作。
### 2. 实现简单对象的变化侦测

技术重点：递归遍历

```
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

var obj = {a:2,b:1}

new Observer(obj)

// 触发get和set
obj.a = obj.b
```

打印结果：
```
get attr
set attr
```
总结：通过递归将两个属性均使用defineProperty()重新定义，可监听到 get和set操作。

至此，我们实现了一个简单对象的变化侦测!

思考与问题：
这种方式只能实现最简单对象属性侦测，属性值只能是简单值类型和Obejct,对于其他类型，无法顺利监听，这部分我们在后面再完善。