module.exports = {
    domify: (type, props = {}, children = []) => {
        let el = document.createElement(type);

        for (let prop in props) {
            el.setAttribute(prop, props[prop]);
        }

        for (let child of children) {
            el.appendChild(child);
        }

        return el;
    }
}