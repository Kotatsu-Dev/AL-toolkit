//begin "alias.js"
const moreStyle = create("style");
moreStyle.id = "conditional-" + scriptInfo.name.toLowerCase() + "-styles";
moreStyle.type = "text/css";

let createAlias = function(alias){
	if(alias[0] === "css/"){
		moreStyle.textContent += alias[1]
	}
}

const shortRomaji = (useScripts.titlecaseRomaji ? m4_include(data/titlecaseRomaji.json) : []).concat(
	(useScripts.shortRomaji ? m4_include(data/shortRomaji.json) : [])
);
//end "alias.js"
