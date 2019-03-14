function Mvvm(obj) {
    this.$el = obj.el;
    this.$data = obj.data;

    new Observer(this.$data);
    new Compiler(this.$el, this);

    proxyData(this.$data, this);
}

function proxyData(data, obj) {
    Object.keys(data).forEach(key => {
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,

            get() {
                return data[key];
            },
            set(val) {
                data[key] = val;
            }
        })
    });
}
