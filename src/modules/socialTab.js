//Morimasa code https://greasyfork.org/en/scripts/375622-betterfollowinglist
const stats = {
	element: null,
	count: 0,
	scoreSum: 0,
	scoreCount: 0
}

const nativeNotes = row => (
	row.querySelector(":scope > span.hover-icon")
	|| Array.from(row.children).find(
		el => el.nodeName === "SPAN" && !el.className && !el.textContent.trim()
	)
	|| null
);

const scoreElement = row => {
	let scores = Array.from(row.children).filter(
		el => el.nodeName === "SPAN"
		&& !el.classList.contains("hover-icon")
		&& !el.classList.contains("notes")
		&& !el.classList.contains("repeat")
		&& el.textContent.trim()
	);
	return scores[scores.length - 1] || row.querySelector(":scope > svg")
};

const hiddenNote = notes => (
	!notes
	|| notes.match(/^,malSync::[a-zA-Z0-9]+=?=?::$/) //no need to show malSync-only notes, nobody is interested in that
	|| notes.match(/^\s+$/) //whitespace-only notes will not show up properly anyway
	|| notes.match(/^\$({.*})\$$/) //list JSON feature
);

const tagsOnlyNote = notes => notes.trim().match(/^(#\S+\s+)*(#\S+)$/);

const scoreColors = e => {
	let el = scoreElement(e);
	let light = document.body.classList.contains("site-theme-dark") ? 45 : 38;
	if(!el){
		return null
	}
	el.classList.add("score");
	if(el.nodeName === "svg"){
		// smiley
		if(el.dataset.icon === "meh"){
			el.childNodes[0].setAttribute("fill",`hsl(60, 100%, ${light}%)`)
		}
		return {
			scoreCount: 0.5,//weight those scores lower because of the precision
			scoreSum: ({"smile": 85,"meh": 60,"frown": 35}[el.dataset.icon])*0.5
		}
	}
	else if(el.nodeName === "SPAN"){
		let score = el.innerText.split("/").map(num => parseFloat(num));
		if(score.length === 1){// convert stars, 10 point and 10 point decimal to 100 point
			score = score[0]*20-10
		}
		else{
			if(score[1] === 10){
				score = score[0]*10
			}
			else{
				score = score[0]
			}
		}
		el.style.color = `hsl(${score*1.2}, 100%, ${light}%)`;
		return {
			scoreCount: 1,
			scoreSum: score,
		}
	}
}

const handler = (data,target,idMap) => {
	if(!target){
		return
	}
	data.forEach(e => {
		const row = target[idMap[e.user.id]];
		if(!row){
			return
		}
		row.style.gridTemplateColumns = "30px minmax(0,1.3fr) minmax(44px,.7fr) minmax(76px,.6fr) 20px 20px minmax(46px,.5fr)"; //css is my passion
		const statusEL = row.querySelector(":scope > .status");
		const scoreEL = scoreElement(row);
		const progress = create("div","progress",e.progress);
		if(e.media.chapters || e.media.episodes){
			progress.innerText = `${e.progress}/${e.media.chapters || e.media.episodes}`;
			if(e.progress > (e.media.chapters || e.media.episodes)){
				progress.title = translate("$socialTab_tooManyChapters")
			}
			else if(
				e.progress === (e.media.chapters || e.media.episodes)
				&& e.status === "COMPLETED"
			){
				progress.style.color = "rgb(var(--color-green))"
			}
		}
		row.insertBefore(progress,statusEL)
		let notesEL = nativeNotes(row);
		if(notesEL){
			if(hiddenNote(e.notes)){
				if(notesEL.classList.contains("hover-icon")){
					notesEL.style.visibility = "hidden"
				}
			}
			else if(tagsOnlyNote(e.notes)){//use a separate symbol for tags-only notes. Also helps popularizing tags
				let icon = notesEL.querySelector("svg");
				if(icon){
					notesEL.replaceChild(svgAssets2.notesTags.cloneNode(true),icon)
				}
			}
		}
		else{
			notesEL = create("span","notes"); // notes
			if(!hiddenNote(e.notes)){
				if(tagsOnlyNote(e.notes)){
					notesEL.appendChild(svgAssets2.notesTags.cloneNode(true))
				}
				else{
					notesEL.appendChild(svgAssets2.notes.cloneNode(true))
				}
				notesEL.title = entityUnescape(e.notes);
			}
		}
		let dateString;
		if(
			e.startedAt.year && e.completedAt.year && e.startedAt.year == e.completedAt.year
			&& e.startedAt.month && e.completedAt.month && e.startedAt.month == e.completedAt.month
			&& e.startedAt.day && e.completedAt.day && e.startedAt.day == e.completedAt.day
		){
			dateString = [
				e.startedAt.year,
				e.startedAt.month,
				e.startedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-")
		}
		else{
			dateString = [
				e.startedAt.year,
				e.startedAt.month,
				e.startedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-") + " - " + [
				e.completedAt.year,
				e.completedAt.month,
				e.completedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-");
		}
		if(
			(e.media.chapters || e.media.episodes) === 1
			&& !e.startedAt.year
			&& e.completedAt.year
		){
			dateString = [
				e.completedAt.year,
				e.completedAt.month,
				e.completedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-")
		}
		if(
			!e.completedAt.year
			&& e.createdAt
			&& e.status === "PLANNING"
		){
			dateString = translate("$mediaStatus_planning_time",new Date(e.createdAt*1000).toISOString().split("T")[0])
		}
		if(dateString !== " - " && statusEL){
			statusEL.title = dateString;
		}
		if(useScripts.partialLocalisationLanguage !== "English" && statusEL){
			let text = statusEL.childNodes[0].textContent;
			statusEL.childNodes[0].textContent = capitalize(translate("$mediaStatus_" + text.toLowerCase(),null,text))
		}
		let rewatchEL = create("span","repeat");
		if(e.repeat){
			rewatchEL.appendChild(svgAssets2.repeat.cloneNode(true));
			rewatchEL.title = e.repeat;
		}
		row.insertBefore(rewatchEL,scoreEL)
		row.insertBefore(notesEL,scoreEL)
	})
}

const MakeStats = () => {
	if(stats.element){
		stats.element.remove()
	}
	let main = create("h2");
	const createStat = (text, number) => {
		let el = create("span",false,text);
		create("span",false,number,el);
		return el
	}
	let count = createStat(translate("$socialTab_users") + ": ",stats.count);
	main.append(count);
	let avg = createStat(translate("$socialTab_shortAverage") + ": ",0);
	avg.style.float = "right";
	main.append(avg);
	const parent = document.querySelector(".following");
	parent.prepend(main);
	stats.element = main
}

function enhanceSocialTab(){
	if(!location.pathname.match(/^\/(anime|manga)\/\d*(\/[\w-]*)?\/social/)){
		return
	}
	let listOfFollowers = Array.from(document.getElementsByClassName("follow"));
	listOfFollowers = listOfFollowers.filter((ele,index) => {
		if(index && listOfFollowers[index - 1].href === ele.href){
			ele.remove();
			return false
		}
		return true
	})
	if(!listOfFollowers.length){
		setTimeout(enhanceSocialTab,100);
		return
	}
	MakeStats();
	let idmap = {};//TODO, rewrite as actual map?
	let namemap = {};
	listOfFollowers.forEach(function(e,i){
		if(!e.dataset.changed){
			const avatarURL = e.querySelector(".avatar").dataset.src;
			const nameEL = e.querySelector(".name");
			if(!avatarURL || avatarURL === "https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png"){
				if(!nameEL || !nameEL.innerText.trim()){
					return
				}
				namemap[nameEL.innerText.trim()] = i
			}
			else{
				const id = avatarURL.split("/").pop().match(/\d+/g)[0];
				idmap[id] = i
			}
			let change = scoreColors(e);
			if(change){
				stats.scoreCount += change.scoreCount;
				stats.scoreSum += change.scoreSum
			}
			++stats.count;
			e.dataset.changed = true
		}
	})
	const mediaID = window.location.pathname.split("/")[2];
	if(Object.keys(namemap).length){
		queryPacker(
			Object.keys(namemap).map(name => {
				return {
					query: `query($name:String,$media:Int){
						Page{
							mediaList(userName: $name,mediaId: $media){
								progress notes repeat user{id}
								startedAt{year month day}
								completedAt{year month day}
								createdAt
								status
								media{chapters episodes}
							}
						}
					}`,
					variables: {name: name,media: parseInt(mediaID)},
					callback: function(res){
						if(!res || !res.data || !res.data.Page || !res.data.Page.mediaList){
							return
						}
						let nameIdmap = {};
						res.data.Page.mediaList.forEach(entry => {
							nameIdmap[entry.user.id] = namemap[name]
						})
						handler(res.data.Page.mediaList,listOfFollowers,nameIdmap)
					}
				}
			})
		)
	}
	if(Object.keys(idmap).length){
		generalAPIcall(
			`query($users:[Int],$media:Int){
				Page{
					mediaList(userId_in: $users,mediaId: $media){
						progress notes repeat user{id}
						startedAt{year month day}
						completedAt{year month day}
						createdAt
						status
						media{chapters episodes}
					}
				}
			}`,
			{users: Object.keys(idmap), media: mediaID},
			function(res){
				let unique = new Map();
				res.data.Page.mediaList.forEach(media => {
					unique.set(media.user.id,media)
				})
				handler(
					Array.from(unique).map(e => e[1]),
					listOfFollowers,
					idmap
				)
			}
		)
	}
	if(Object.keys(idmap).length || Object.keys(namemap).length){
		let statsElements = stats.element.querySelectorAll("span > span");
		statsElements[0].innerText = stats.count;
		const avgScore = Math.round(stats.scoreSum/stats.scoreCount || 0);
		if(avgScore){
			statsElements[1].style.color = `hsl(${avgScore*1.2}, 100%, 40%)`;
			statsElements[1].innerText = `${avgScore}%`;
			statsElements[1].title = (stats.scoreSum/stats.scoreCount).toPrecision(4)
		}
		else{
			statsElements[1].parentNode.remove() // no need if no scores
		}
		statsElements[1].onclick = function(){
			statsElements[1].classList.toggle("toggled");
			Array.from(root.querySelectorAll(".follow")).forEach(function(item){
				if(item.querySelector(".score") || !statsElements[1].classList.contains("toggled")){
					item.style.display = "grid"
				}
				else{
					item.style.display = "none"
				}
			})
		}
	}
/*add average score to social tab*/
	let root = listOfFollowers[0].parentNode;
	let distribution = {};
	Object.keys(distributionColours).forEach(
		status => distribution[status] = 0
	);
	listOfFollowers.forEach(function(follower){
		let statusType = follower.querySelector(".status").innerText.toUpperCase();
		if(statusType === "WATCHING" || statusType === "READING"){
			statusType = "CURRENT"
		}
		distribution[statusType]++
	});
	if(
		Object.keys(distributionColours).some(status => distribution[status] > 0)
	){
		let locationForIt = document.getElementById("averageScore");
		let dataList = document.getElementById("socialUsers");
		let statusList = document.getElementById("statusList");
		if(!locationForIt){
			let insertLocation = document.querySelector(".following");
			insertLocation.parentNode.style.marginTop = "5px";
			insertLocation.parentNode.style.position = "relative";
			locationForIt = create("span","#averageScore");
			insertLocation.insertBefore(
				locationForIt,
				insertLocation.children[0]
			);
			statusList = create("span","#statusList",false,false,"position:absolute;right:0px;top:5px;");
			insertLocation.insertBefore(
				statusList,
				insertLocation.children[0]
			);
			dataList = create("datalist","#socialUsers");
			insertLocation.insertBefore(
				dataList,
				insertLocation.children[0]
			);
			if(insertLocation.parentNode.children[0].nodeName === "H2"){
				insertLocation.parentNode.children[0].classList.remove("link");
				insertLocation.parentNode.children[0].classList.remove("router-link-exact-active");
				insertLocation.parentNode.children[0].classList.remove("router-link-active")
			}
		}
		locationForIt.nextSibling.style.marginTop = "5px";
		if(dataList.childElementCount < listOfFollowers.length){
			listOfFollowers.slice(dataList.childElementCount).forEach(
				follower => create("option",false,false,dataList)
					.value = follower.children[1].innerText
			)
		}
		removeChildren(statusList);
		let sortStatus = "";
		semmanticStatusOrder.forEach(status => {
			if(distribution[status]){
				let statusSumDot = create("div","altoolkitSummableStatus",distribution[status],statusList);
				statusSumDot.style.background = distributionColours[status];
				statusSumDot.title = distribution[status] + " " + capitalize(translate("$mediaStatus_" + status.toLowerCase()));
				if(distribution[status] > 99){
					statusSumDot.style.fontSize = "8px"
				}
				if(distribution[status] > 999){
					statusSumDot.style.fontSize = "6px"
				}
				statusSumDot.onclick = function(){
					if(sortStatus === status){
						Array.from(root.querySelectorAll(".follow .status")).forEach(item => {
							item.parentNode.style.display = "grid"
						})
						sortStatus = ""
					}
					else{
						Array.from(root.querySelectorAll(".follow .status")).forEach(item => {
							if(item.innerText.toUpperCase() === status || (["WATCHING","READING"].includes(item.innerText.toUpperCase()) && status === "CURRENT")){
								item.parentNode.style.display = "grid"
							}
							else{
								item.parentNode.style.display = "none"
							}
						})
						sortStatus = status
					}
				}
			}
		});
	}
	let waiter = function(){
		setTimeout(function(){
			if(root.childElementCount !== listOfFollowers.length){
				enhanceSocialTab()
			}
			else{
				waiter()
			}
		},100);
	};waiter()
}
