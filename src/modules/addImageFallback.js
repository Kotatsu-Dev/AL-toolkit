function addImageFallback(){
	if(!document.URL.match(/(\/home|\/user\/)/)){
		return
	}
	setTimeout(addImageFallback,1000);
	let mediaImages = document.querySelectorAll(".media-preview-card:not(.altoolkitFallback) .content .title");
	mediaImages.forEach(cover => {
		cover.parentNode.parentNode.classList.add("altoolkitFallback");
		if(cover.parentNode.parentNode.querySelector(".altoolkitFallback")){
			return
		}
		let fallback = create("span","altoolkitFallback",cover.textContent,cover.parentNode.parentNode);
		if(useScripts.titleLanguage === "ROMAJI"){
			fallback.textContent = cover.textContent;
		}
	})
}
