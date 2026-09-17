function createDisplayBox(cssProperties,windowTitle){
	let displayBox = create("div","altoolkitDisplayBox",false,document.querySelector("#app") || document.querySelector(".termsFeed") || document.body,cssProperties);
	if(windowTitle){
		create("span","altoolkitDisplayBoxTitle",windowTitle,displayBox)
	}
	let mousePosition;
	let offset = [0,0];
	let isDown = false;
	let isDownResize = false;
	let displayBoxClose = create("span","altoolkitDisplayBoxClose",svgAssets.cross,displayBox);
	displayBoxClose.onclick = function(){
		displayBox.remove();
	};
	let resizePearl = create("span","altoolkitResizePearl",false,displayBox);
	displayBox.addEventListener("mousedown",function(e){
		let root = e.target;
		while(root.parentNode){//don't annoy people trying to copy-paste
			if(root.classList.contains("scrollableContent")){
				return
			}
			root = root.parentNode
		}
		isDown = true;
		offset = [
			displayBox.offsetLeft - e.clientX,
			displayBox.offsetTop - e.clientY
		];
	},true);
	resizePearl.addEventListener("mousedown",function(event){
		event.stopPropagation();
		event.preventDefault();
		isDownResize = true;
		offset = [
			displayBox.offsetLeft,
			displayBox.offsetTop
		];
	},true);
	document.addEventListener("mouseup",function(){
		isDown = false;
		isDownResize = false;
	},true);
	document.addEventListener("mousemove",function(event){
		if(isDownResize){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.width = (mousePosition.x - offset[0] + 5) + "px";
			displayBox.style.height = (mousePosition.y - offset[1] + 5) + "px";
			return;
		}
		if(isDown){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.left = (mousePosition.x + offset[0]) + "px";
			displayBox.style.top  = (mousePosition.y + offset[1]) + "px";
		}
	},true);
	let innerSpace = create("div","scrollableContent",false,displayBox);
	return innerSpace;
}
