import {selectorFor} from "../components/helper.js";
export { h, mini }

function h(name, attributes, node) {
    const children =
        node instanceof Array
        ? node
        : node != null ? [node] : [];
    return {
        name:       name,
        attributes: attributes || {},
        children:   children
    }
}
function mini(view, state, root, onRefreshed=(x=>x)) {
    let place = render(view(act, state));
    root.appendChild(place);

    function render(node) {
        if (typeof node === "string" || typeof node === "number") {
            return document.createTextNode(node)
        }
        const element = document.createElement(node.name);
        Object.entries(node.attributes).forEach(([key, value]) =>
            typeof value === "function" ? element.addEventListener(key, value) : element.setAttribute(key, value)
        );
        node.children.forEach(child => element.appendChild(render(child)));
        return element;
    }
    function refresh() {
        const focusElement = document.querySelector(":focus");
        if (focusElement) {state.focussed = selectorFor(focusElement);}
        const newView = render(view(act, state), root);
        root.replaceChild(newView, place);
        place = newView;
        state = onRefreshed(state) || state;
    }
    function act(action) { return event => {
        const t = action(state, event); state = t === undefined ? state : t;
        refresh();
    }   }
}