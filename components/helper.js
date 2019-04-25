
export {progressStyle, allowDrop, drop}

const progressStyle = pct => {
    const red   = "rgba(255,0,0, 0.7)";
    const green = "rgba(115,153,150,0.7)";
    return `background: linear-gradient(90deg, ${red}, ${red} ${pct}%, ${green} ${pct}%, ${green} );`
};

function allowDrop(evt) {
    evt.target.classList.add("drop");
    evt.preventDefault(); // default is not to allow drags.
}

const drop = action => evt => {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    evt.target.classList.remove("drop");
    action(data, evt.target.id);
};
