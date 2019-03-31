// promise的三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function Promise(executor) {
    this.status = PENDING; // 初始化后的状态为pending
    
    this.onResolvedCallbacks = []; // 成功的回调函数
    this.onRejectedCallbacks = []; // 失败的回调函数

    // 2.1
    let resolve = (value) => { // 2.1.1 只会从pending状态转换为fulfilled或rejected状态
        if(value instanceof Promise) {
            return value.then(resolve, reject);
        }
        setTimeout(() => {
            if(this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.onResolvedCallbacks.forEach(cb => cb.call(this, this.value));
            }
        });
    }

    let reject = (reason) => { // 2.1.2
        setTimeout(() =>{
            if(this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
                this.onRejectedCallbacks.forEach(cb => cb.call(this, this.reason));
            }
        });
    }

    try{
        // 初始化时可能会出错，如果出错，则使用错误对象reject
        executor(resolve, reject);
    }catch(e) {
        reject(e);
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    if(promise2 === x) {
        return reject(new TypeError('循环引用'));
    }
    let called = false; // promise2是否resolve或者reject过了
    if(x instanceof Promise) {
        if(x.status === PENDING) {
            x.then((y) =>{
                resolvePromise(promise2, y, resolve, reject);
            }, reject)
        }else {
            x.then(resolve, reject);
        }
    // x是一个thenable对象或函数
    }else if(typeof x === 'object' || typeof x === 'function') {
        try{
            let then = x.then;
            // x的then属性是否为方法，不是方法则直接将x作为值resolve
            if(typeof then === 'function') {
                then.call(x, 
                (y) =>{
                    if(called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject);
                },
                (err) => {
                    if(called) return;
                    called = true;
                    reject(err);
                });
            }else{
                resolve(x);
            }
        }catch(e) {
            if(called) return;
            called = true;
            reject(e);
        }
    // x是一个普通值
    }else {
        resolve(x);
    }
}

Promise.prototype = {
    constructor: Promise,

    then(onFulfilled, onRejected) {
        // then的参数如果没有传就将值往后传 2.2.1
        let _this = this;
        let promise2 = null;
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

        // 如果此时状态是fulfilled时onFulfilled直接取值
        if(this.status === FULFILLED) {
            return promise2 = new Promise((resolve, reject) =>{
                setTimeout(() => {
                    try{  
                        let x = onFulfilled(_this.value);
                        // 这里解析promise是因为在then里面可能返回的是个Promise
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e) {
                        reject(e);
                    }
                });
            });
        }
        if(this.status === REJECTED) {
            return promise2 = new Promise((resolve, reject) => {
                setTimeout(() => {
                    try{
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e) {
                        reject(e)
                    }
                });
            });
        }
        if(this.status === PENDING) {
            return promise2 = new Promise((resolve, reject) =>{
                this.onResolvedCallbacks.push(() => {
                    try{
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e) {
                        reject(e);
                    }
                });
                this.onRejectedCallbacks.push(() => {
                    try{
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }catch(e) {
                        reject(e);
                    }
                });
            });
        }
    },

    catch(onRejected) {
        this.then(null, onRejected);
    },

    // finally() {

    // }
}

// Promise.all = function() {

// };

// Promise.race = function() {

// };

// Promise.resolve = function() {

// };

// Promise.reject = function() {

// };