export const createElement = (elementName, attributes = {}, children) => {
    const element = document.createElement(elementName);

    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }

    forEach(
        castArray(children),
        child => appendChild(child, element)
    );

    return element;
};

const appendChild = (child, element) => {
    if (isElement(child)) {
        element.appendChild(child);
    } else if (isPrimitive(child)) {
        const text = document.createTextNode(child);
        element.appendChild(text);
    }
}

export const castArray = (value) => {
    return Array.isArray(value) ? value : [value];
}

export const isPrimitive = (value) => {
    return isString(value) || isNumber(value);
}

export const isFunction = (value) => {
    return typeof (value) === 'function';
};

export const isString = (value) => {
    return typeof (value) === 'string';
};

export const isNumber = (value) => {
    return typeof (value) === 'number';
};

export const isElement = (value) => {
    return value instanceof Element;
}

export const createEventListener = (element, event, callback) => {
    element.addEventListener(event, callback, false);

    return () => {
        element.removeEventListener(event, callback, false);
    };
};

export const forEach = (array, callback) => {
    if (Array.isArray(array) && array.length) {
        array.forEach(callback);
    }
};

export const noop = () => (null);

export const bindAll = (functions, context) => {
    functions.forEach(funName => {

        if (isFunction(context[funName])) {
            context[funName] = context[funName].bind(context)
        }
    });
}
