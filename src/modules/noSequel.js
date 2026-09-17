const sequelList = new Set(m4_include(data/sequels.json))
const sequelList_manga = new Set(m4_include(data/sequels_manga.json))

exportModule({
	id: "noSequel",
	description: "$noSequel_description",
	extendedDescription: "$noSequel_extendedDescription",
	isDefault: true,
	importance: 1,
	categories: ["Browse","Newly Added"],
	visible: true,
	urlMatch: function(){
		return /^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname)
	},
	code: function(){
		let optionInserter = function(){
			if(!(/^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname))){
				return
			}
			let place = document.querySelector(".primary-filters .filters");
			if(!place){
				setTimeout(optionInserter,500);
				return
			}
			place.style.position = "relative";
			if(document.querySelector(".altoolkitNoSequelSetting")){
				return
			}
			let setting = create("span","altoolkitNoSequelSetting",false,place);
			let input = createCheckbox(setting);
			input.classList.add("altoolkitNoSequelSetting_input");
			input.checked = useScripts.noSequel_value;
			input.onchange = function(){
				useScripts.noSequel_value = this.checked;
				useScripts.save();
			}
			create("span",false,translate("$hideSequels"),setting);
			let remover = setInterval(function(){
				if(!(/^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname))){
					clearInterval(remover);
					return
				}
				let input = document.querySelector(".altoolkitNoSequelSetting_input");
				if(!input){
					clearInterval(remover);
					return
				}
				Array.from(document.querySelectorAll(".media-card")).forEach(hit => {
					const cover = hit.querySelector(".cover");
					if(!cover) return
					let link = "";
					if(cover.href) link = cover.href;
					else{
						let img = cover.querySelector(".image-link");
						if(img && img.href) link = img.href;
						else return
					}
					let id = link.match(/(anime|manga)\/(\d+)\//);
					if(id && id[2]){
						id = parseInt(id[2]);
						if((sequelList.has(id) || sequelList_manga.has(id) || link.match(/2nd|3rd|season-2|season-3|season-4|part-2|part-3|part-4/i) || link.match(/-2\/$/i)) && input.checked){
							hit.classList.add("altoolkitHiddenSequel")
						}
						else{
							hit.classList.remove("altoolkitHiddenSequel")
						}
					}
				})
			},500)
		};
		optionInserter()
	},
	css: ".altoolkitHiddenSequel{display: none!important}"
})
