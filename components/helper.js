
export {progressStyle, allowDrop, drop, selectorFor, nullSafe}

const progressStyle = (pct, redOnGreen) => {
    const red   = "rgba(255,0,0, 0.7)";
    const green = "rgba(115,153,150,0.7)";
    return redOnGreen
        ? `background: linear-gradient(90deg, ${red}, ${red} ${pct}%, ${green} ${pct}%, ${green} );`
        : `background: linear-gradient(90deg, ${green}, ${green} ${pct}%, ${red} ${pct}%, ${red} );`;
};

function allowDrop(evt) {
    evt.target.classList.add("drop");
    evt.preventDefault(); // default is not to allow drags.
}

const drop = action => evt => {
    evt.preventDefault();
    const data = evt.dataTransfer.getData("text");
    evt.target.classList.remove("drop");
    action(data, evt.target.id);
};


const isNull = it => null === it || undefined === it;

const nullSafe = fn => x =>
    isNull(x)
    ? x
    : fn(x)
;

/**
 * Two functions _may_ be composed if the argument and passed-on value are not null or undefined.
 * Same purpose as binding the Maybe monad or Groovy's ?: elvis operator.
 * @param fn the function to compose
 * @returns {Function} the maybe composed function
 */
Function.prototype.may = function(fn) {
    const delegate = this;
    return function (x) {
        if (isNull(x)) {
            return x;
        } else {
            const result = delegate(x);
            return isNull(result) ? result : fn(result);
        }
    }
};


// adapted from
// https://stackoverflow.com/questions/4588119/get-elements-css-selector-when-it-doesnt-have-an-id
function selectorFor(element) {
    const names = [];
    while (element.parentNode) {
        if (element.id && isNaN(element.id)) { // numbers can be used in ids but they do not work in selectors
            names.unshift('#' + element.id);
            break;
        } else {
            if (element === element.ownerDocument.documentElement) {
                names.unshift(element.tagName);
            } else {
                let count = 1;
                let e = element;
                while (e.previousElementSibling) {
                    e = e.previousElementSibling;
                    count++;
                }
                names.unshift(element.tagName + ":nth-child(" + count + ")");
            }
            element = element.parentNode;
        }
    }
    return names.join(" > ");
}

