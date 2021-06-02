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