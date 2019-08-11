class Watcher{
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        this.val = this.getOldVal();
    }

    // 获取原来的值
    getOldVal() {
        // 编译的时候回获取值，但此时Dep上是没有target属性的，只有添加观察者的时候才会添加target
        Dep.target = this;
        let value = this.getVal(this.vm, this.expr); // 取值的时候会调用响应式的get方法
        // 销毁target的目的是只在添加观察者的时候添加订阅，在编译的时候获取值不会添加订阅
        Dep.target = null;

        return value;
    }

    getVal(vm, expr) {
        let objProps = expr.split('.');

        return objProps.reduce((prev, cur) => {
            return prev[cur];
        }, vm.$data);
    }

    // 对外暴露的方法
    update() {
        let newVal = this.getVal(this.vm, this.expr);
        let oldVal = this.val;

        if(newVal !== oldVal) {
            this.cb(newVal, oldVal);
        }
    }
}