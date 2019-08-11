class Compiler{
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        // 容错，或许用户传入的字符串获取不到元素
        if(this.el) {
            // 获取带节点后先将节点放入fragment中去，在内存中操作dom会比直接操作dom快的多，最后再放回页面
            // 1.放入内存
            let fragment = this.node2fragment(this.el);
            // 2.开始编译
            this.compile(fragment);
            // 3.将编译好的内容塞回页面
            this.el.appendChild(fragment);
            fragment = null;
        }
    }

    /* 核心方法 */
    // 将元素放入内存中的文档碎片中
    node2fragment(el) {
        let fragment = document.createDocumentFragment();

        let firstChild;
        while(firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

    // 编译元素节点
    compileElementNode(elementNode) {
        let attrs = elementNode.attributes; // 获取当前元素的属性，返回的是一个由属性组成的类数组
        for(let i = 0, len = attrs.length; i < len; i++) {
            let attrName = attrs[i].name;
            if(this.isDirective(attrName)) {
                let expr = attrs[i].value;
                let directiveType = attrName.slice(2); // [, directive] = expr.split('-');

                CompilerUtil[directiveType] && CompilerUtil[directiveType](elementNode, this.vm, expr);
            }
        }
        
        for(let i = 0, len = attrs.length; i < len; i++) {
            let attrName = attrs[i].name;
            attrName.startsWith('v-') && elementNode.removeAttribute(attrName);
        }
    }

    // 编译文本节点
    compileTextNode(textNode) {
        let expr = textNode.textContent;
        let reg = /\{\{([^}]+)\}\}/g;

        if(reg.test(expr)) { // 有可能写的是这样的 {{a}} {{b}} {{c}}
            CompilerUtil['text'](textNode, this.vm, expr);
        }
    }

    // 编译
    compile(fragment) {
        let childNodes = fragment.childNodes;

        for(let i = 0, len = childNodes.length; i < len; i++) {
            let node = childNodes[i];
            if(this.isElementNode(node)) {
                // 编译元素节点
                this.compileElementNode(node);
                this.compile(node); // 递归遍历含有子节点的元素节点编译其中的文本节点
            }else {
                // 编译文本节点
                this.compileTextNode(node);
            }
        }
    }

    /* 工具方法 */
    // 是否为元素节点
    isElementNode(node) {
        return node.nodeType === 1;
    }

    // 是否为指令
    isDirective(attrName) {
        return attrName.startsWith('v-');
    }
}

CompilerUtil = {
    // 获取
    getVal(vm, expr){
        let objProps = expr.split('.');

        return objProps.reduce((prev, cur) => {
            return prev[cur];
        }, vm.$data);
    },

    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...rest) => {
            return this.getVal(vm, rest[1]);
        });
    },

    // v-text的指令编译
    text(node, vm, expr) {
        let updateFn = this.updater.textUpdater;
        let val = this.getTextVal(vm, expr);
        expr.replace(/\{\{([^}]+)\}\}/g, (...rest) => {
            new Watcher(vm, rest[1], () => {
                /** 
                 * 这里第二个参数传this.getTextVal(vm, expr)是因为：
                 * 如果{{a}} {{b}}像这样写的话
                 * 只更新a，传newVal会导致updateFn执行后的结果为node.textContent = newVal，只将a进行了更新而b会消失
                 * 这里的newVal就只有a更新后的值，而不是a更新后b还是原值
                 * 
                 * this.getTextVal()返回的是 a b（这里的a和b表示data上的属性所代表的值）
                */
                updateFn && updateFn(node, this.getTextVal(vm, expr));
            });
        });

        updateFn && updateFn(node, val);
    },

    // 输入框的指令编译处理
    model(node, vm, expr) {
        let updateFn = this.updater.modelUpdater;

        // 这里要给每一个v-model的值添加一个观察者，数据变化了就应该调用watch里面的cb
        new Watcher(vm, expr, (newVal) => {
            updateFn && updateFn(node, newVal);
        });

        node.addEventListener('input', (e) => {
            let newVal = e.target.value;
            this.setVal(vm, expr, newVal); // 给data重新设置值
        }, false);

        updateFn && updateFn(node, this.getVal(vm, expr));
    },

    setVal(vm, expr, val) {
        expr = expr.split('.');

        expr.reduce((prev, cur, index) => {
            if(index === expr.length - 1) {
                prev[cur] = val;
            }

            return prev[cur];
        }, vm.$data);
    },

    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value;
        },

        // 输入框更新
        modelUpdater(node, value) {
            node.value = value;
        }
    }
}