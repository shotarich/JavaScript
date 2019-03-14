class Observer{
    constructor(data) {
        this.observe(data);
    }

    observe(data) {
        if(!data || typeof data !== 'object') {
            return;
        }

        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]); // 深度劫持
        });
    }

    // 定义响应式
    defineReactive(obj, key, val) {
        let _this = this;
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,

            get() {
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set(newVal) {
                if(newVal !== val) {
                    _this.observe(newVal); // 在赋值的时候如果赋值的是一个新对象，也对其实现响应式
                    val = newVal;
                    dep.notify();
                }
            }
        })
    }
}

class Dep{
    constructor() {
        this.subs = [];
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}