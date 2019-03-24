const fs = require('fs');
function include(path) {
    if(typeof path !== 'string') {
        throw new Error('');
    }

    path = path.endsWith('.js') ? path : path + '.js'; // path = path.slice(-3) === '.js' ? path : path + '.js';
    const content = fs.readFileSync(path, 'utf8');

    let module = {
        exports: {}
    };

    let resFn = new Function('exports', 'module', 'require', '__dirname', '__filename',
        content
    );
    /* 
        最终resFn这个函数是这样
        function resFn(exports, module, include, __dirname, __filename) {
            // 下面的内容是require进来的content
            function add(a, b) {
                return a + b;
            }
            module.exports = add;
        }
    */


    resFn(module.exports, module, include, __dirname, __filename);

    return module.exports;
}

const add = include('./mod');
// let sum = add(4, 6);
console.log(add);

