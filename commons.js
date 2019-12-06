const createElement = (tag, attributs = {}, children) => {
    const element = document.createElement(tag);
    for (let key in attributs) {
        element.setAttribute(key, attributs[key]);
    }

    switch (typeof (children)) {
        case 'string':
        case 'number':
            const text = document.createTextNode(children);
            element.appendChild(text);
            break;
        default:
            break;
    }

    return element;
};


const isFunction = (func) => {
    return typeof (func) === 'function';
};


const isString = (func) => {
    return typeof (func) === 'string';
};


const createEventListener = (element, event, callback) => {
    element.addEventListener(event, callback, false);
    return () => {
        element.removeEventListener(event, callback, false);
    };
};


const forEach = (array, callback) => {
    if (Array.isArray(array) && array.length) {
        array.forEach(callback);
    }
};


const noop = () => (null);