function createElement(type, props, children) {
    return new Element(type, props, children)
}

class Element{
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}

function render(eleObj) {
    let el = document.createElement(eleObj.type);
    let props = eleObj.props;
    for(let attr in props) {
        setAttr(el, attr, props[attr])
    }

    eleObj.children instanceof Array && eleObj.children.forEach(child => {
        // 判断子元素是否是虚拟DOM
        child = child instanceof Element ? render(child) : document.createTextNode(child);
        el.appendChild(child);
    }); 
    return el;
}

function setAttr(node, attr, value) {
    switch (attr) {
        case 'value':
            if(node.tagName.toLowerCase() === 'input' || node.tagName.toLowerCase() === 'textarea') {
                node.value = value;
            }else {
                node.setAttribute(attr, value);
            }
            break;
        case 'style':
            value = typeof value === 'object' ? formatStyle(value) : value;
            node.style.cssText = value;
            break;
        default:
            node.setAttribute(attr, value);
            break;
    }
}

function formatStyle(styleObj) {
    let styleStr = '';
    for(let key in styleObj) {
        styleStr += `${key}:${styleObj[key]}`;
    }
    return styleStr;
}

function renderDom(el, target) {
    target.appendChild(el);
}