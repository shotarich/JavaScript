// function add(a, b) {
//     return a + b;
// }
// module.exports = add;
exports.add = 56;

/* 
    const module = {
        id: '',
        exports: {}
    };
    const fs;

    function require(path) {
        if(typeof path !== 'string') {
            throw new Error('Cannot find module ' + path);
        }

        path = path.endsWith('.js') ? path : path + '.js';
        const content = fs.readFileSync(path, 'utf8');
        const module = {
            exports: {}
        };

        let resFn = new Function('exports', 'module', 'require', '__dirname', '__filename',
            content + '\n return module.exports;'
        );

        return resFn(module.exports, module, include, __dirname, __filename); 
    }

    (function (exports, module, require, __dirname, __filename) {
        // 这个文件所有的代码都将被转换到这里，其他的代码都是不可见的
    })(module.exports, module, require, __dirname, __filename);
*/