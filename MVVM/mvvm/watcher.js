class Watcher{
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        this.val = this.getOldVal();
    }

    // 获取原来的值
    getOldVal() {
        Dep.target = this;
        let value = this.getVal(this.vm, this.expr);
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