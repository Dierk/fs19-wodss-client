const status = document.getElementById("status");

function allowDrop(evt) {
    evt.target.classList.add("drop");
    evt.preventDefault(); // default is not to allow drags.
}

function drop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    status.innerText = `dropped developer ${data} onto project ${evt.target.id}`;
    evt.target.classList.remove("drop");
}

[1, 2, 3].forEach(num => {
    const dev = document.getElementById("dev" + num);
    const pro = document.getElementById("pro" + num);
    dev.draggable   = true;
    dev.ondragstart = evt => evt.dataTransfer.setData("text", evt.target.id);
    pro.ondrop      = drop;
    pro.ondragover  = allowDrop;
    pro.ondragleave = evt => evt.target.classList.remove("drop");
});


