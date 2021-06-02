const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
    ;['push', 'pop', 'shift', 'unshift', 'sort', 'splice', 'reverse'].forEach(function (method) {
        // 保存原始方法
        const origin = arrayProto[method]
        Object.defineProperty(arrayMethods, method, {
            value: function (...args) {
                const ob = this.__ob__
                let inserted
                switch (method) {
                    case 'push':
                    case 'unshift':
                        inserted = args
                        break;
                    default:
                        break;
                }
                // 侦测数组新增元素
                if (inserted) {
                    debugger
                    ob.observeArray(inserted) // 对新增元素进行观测（如果是引用类型的话）
                }
                ob.dep.notify()  // 向依赖发布消息
                return origin.apply(this, args)
            },
            enumerable: false,
            writable: true,
            configurable: true
        })
    })


// 递归实现对象的全属性变化侦测
function Observer(obj) {
    const hasProto = '__proto__' in {}
    const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
    this.dep = new Dep()

    this.observeArray = function (items) {
        items.map(item => {
            observe(item)
        })
    }

    def(obj, '__ob__', this)

    if (Array.isArray(obj)) {
        const arugment = hasProto ? protoAugment : copyAugment
        arugment(obj, arrayMethods, arrayKeys)
        this.observeArray(obj)
    } else {
        Object.keys(obj).map(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}

function observe(value, asRootData) {
    if (!isObject(value)) {
        return
    }
    let ob
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else {
        ob = new Observer(value)
    }
    return ob
}
// 挂在到原型
function protoAugment(target, src, keys) {
    target.__proto__ = src
}
// 挂载到对象
function copyAugment(target, src, keys) {
    keys.map(key => {
        def(target, key, src[key])
    })
}

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}
function hasOwn(target, val) {
    return target[val]
}

function defineReactive(data, key, val) {
    // if (typeof val === 'object') {
    //     new Observer(val)
    // }
    let childOb = observe(val)
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            console.log('get attr');
            // dep.depend()
            if (childOb) {
                debugger
                childOb.dep.depend()  // 收集依赖
            }
            return val
        },
        set: function (newVal) {
            if (val === newVal) {
                return
            }
            val = newVal
            console.log('set attr');
            dep.notify()
        }
    })
}

function parsePath(path) {
    const reg = /[^\w.$]/
    if (reg.test(path)) return

    const segs = path.split('.')

    // 返回一个函数，调用后，path读取obj对应keypath的值
    return function (obj) {
        for (let i = 0, len = segs.length; i < len; i++) {
            if (!obj) return
            obj = obj[segs[i]]
        }
        return obj
    }
}

function Watcher(data, expOrFn, callback) {
    this.data = data
    this.callback = callback
    this.deps = []
    this.getter = parsePath(expOrFn)
    debugger
    this.get = function () {
        Dep.target = this
        const val = this.getter.call(this.vm, this.vm)

        // const val = callback.call(this.data,this.data)
        Dep.target = null
        return val
    }

    this.value = this.get()

    this.update = function () {
        this.value = this.get()  // 再收集一次依赖
        debugger
        callback.call(this.value)
    }
    // this.update = callback.bind(data)

    this.addDep = function (dep) {
        this.deps.push(dep)
    }
}

function Dep() {
    this.subs = []
    this.addSub = function (watcher) {
        this.subs.push(watcher)
    }
    this.depend = function () {
        if (Dep.target) {
            console.log('dep append')
            this.addSub(Dep.target)
        }
    }
    // todo 没收集到依赖subs为空
    this.notify = function () {
        this.subs.forEach(watcher => watcher.update())
    }
}

var data = {
    arr: [1, 2, 3]
}
new Observer(data)
const arr = data.arr
new Watcher(data, 'arr', (data) => {
    const dom = document.querySelector('p')
    debugger
    const len = data.length
    dom.innerHTML = data[len - 1] // 此处的值获取，将依赖记录到了dep中
    console.log("p.innerHTML:", dom.innerHTML)
})

arr.push(4)