const createElement = (elementName, attributs = {}, children) => {
    const element = document.createElement(elementName);

    for (let key in attributs) {
        element.setAttribute(key, attributs[key]);
    }

    forEach(
        Array.isArray(children) ? children : [children],
        child => appendChild(child, element)
    );

    return element;
};


const appendChild = (child, element) => {
    if (isElement(child)) {
        element.appendChild(child);
    }
    else if (isString(child) || isNumber(child)) {
        const text = document.createTextNode(child);
        element.appendChild(text);
    }
}


const isFunction = (value) => {
    return typeof (value) === 'function';
};


const isString = (value) => {
    return typeof (value) === 'string';
};

const isNumber = (value) => {
    return typeof (value) === 'number';
};

const isElement = (value) => {
    return value instanceof Element;
}


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