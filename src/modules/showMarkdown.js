function showMarkdown(id){
	if(!location.pathname.match(id)){
		return
	}
	if(document.querySelector(".altoolkitGetMarkdown")){
		return
	}
	let timeContainer = document.querySelector(".activity-text .time,.activity-message .time");
	if(!timeContainer){
		setTimeout(function(){showMarkdown(id)},200);
		return
	}
	if(!useScripts.accessToken && document.querySelector(".private-badge")){
		return//can't fetch private messages without privileges
	}
	let codeLink = create("span",["action","altoolkitGetMarkdown"],"</>",false,"font-weight:bolder;");
	timeContainer.insertBefore(codeLink,timeContainer.firstChild);
	codeLink.onclick = function(){
		let activityMarkdown = document.querySelector(".activity-markdown");
		if(activityMarkdown.style.display === "none"){
			let markdownSource = document.querySelector(".altoolkitMarkdownSource");
			if(markdownSource){
				markdownSource.style.display = "none"
			}
			activityMarkdown.style.display = "initial"
		}
		else{
			activityMarkdown.style.display = "none";
			let markdownSource = document.querySelector(".altoolkitMarkdownSource");
			if(markdownSource){
				markdownSource.style.display = "initial"
			}
			else{
				const caller = (document.querySelector(".private-badge") ? authAPIcall : generalAPIcall);
				caller("query($id:Int){Activity(id:$id){...on MessageActivity{text:message}...on TextActivity{text}}}",{id:id},function(data){
					if(!location.pathname.match(id)){
						return
					}
					if(!data){
						markdownSource = create("div",["activity-markdown","altoolkitMarkdownSource","altoolkitError"],translate("$error_markdown"),activityMarkdown.parentNode);
						return
					}
					markdownSource = create("div",["activity-markdown","altoolkitMarkdownSource"],data.data.Activity.text,activityMarkdown.parentNode);
				},"altoolkitGetMarkdown" + id,20*1000)
			}
		}
	}
}
