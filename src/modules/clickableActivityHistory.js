exportModule({
	id: "clickableActivityHistory",
	description: "Displays activities for an entry in the activity history",
	isDefault: true,
	categories: ["Navigation","Profiles"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match(/\/user\/[^/]+\/?$/);
	},
	code: function(){
		if(!useScripts.termsFeed){
			return
		}
		let waiter = function(){
			let activityHistory = document.querySelector(".activity-history");
			if(!activityHistory){
				setTimeout(waiter,1000);
				return
			}
			activityHistory.onclick = function(event){
				let target = event.target;
				if(target && target.classList.contains("history-day")){
					if(target.classList.contains("lv-0")){
						return
					}
					let offset = 1;
					while(target.nextSibling){
						offset++;
						target = target.nextSibling
					}
					let squareDate = new Date();
					squareDate.setHours(0,0,0,0);
					squareDate.setDate(squareDate.getDate() - (offset - 1));
					let year = squareDate.getFullYear();
					let month = squareDate.getMonth() + 1;
					let day = squareDate.getDate();
					window.location.href = "https://anilist.co/terms?user=" + encodeURIComponent(document.querySelector("h1.name").innerText) + "&date=" + year + "-" + month + "-" + day
				}
			}
		};waiter()
	}
})
