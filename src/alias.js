//begin "alias.js"
const moreStyle = create("style");
moreStyle.id = "conditional-" + scriptInfo.name.toLowerCase() + "-styles";
moreStyle.type = "text/css";

let createAlias = function(alias){
	if(alias[0] === "css/"){
		moreStyle.textContent += alias[1]
	}
	else{
		const dataSelect = `[href^="${alias[0]}"]`;
		const targetName = alias[1].substring(0,Math.min(100,alias[1].length));
		moreStyle.textContent += `
.title > a${dataSelect}
,a.title${dataSelect}
,.overlay > a.title${dataSelect}
,.media-preview-card a.title${dataSelect}
,.quick-search-results .el-select-dropdown__item a${dataSelect}> span
,.media-embed${dataSelect} .title
,.status > a.title${dataSelect}
,.role-card a.content${dataSelect} > .name{
	visibility: hidden;
	line-height: 0px!important;
	font-size: 0px!important;
}

a.title${dataSelect}::before
,.quick-search-results .el-select-dropdown__item a${dataSelect} > span::before
,.role-card a.content${dataSelect} > .name::before
,.home .status > a.title${dataSelect}::before
,.media-embed${dataSelect} .title::before
,.overlay > a.title${dataSelect}::before
,.media-preview-card a.title${dataSelect}::before
,.title > a${dataSelect}::before{
	content:"${targetName}";
	visibility: visible;
	font-size: 1.4rem;
	line-height: 1.15;
}`;
	}
}

const shortRomaji = (useScripts.titlecaseRomaji ? m4_include(data/titlecaseRomaji.json) : []).concat(
	(useScripts.shortRomaji ? m4_include(data/shortRomaji.json) : [])
);
//end "alias.js"
