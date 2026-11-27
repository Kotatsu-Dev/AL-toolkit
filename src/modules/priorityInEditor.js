exportModule({
	id: "priorityInEditor",
	description: "$priorityInEditor_description",
	extendedDescription: "$priorityInEditor_extendedDescription",
	isDefault: false,
	importance: 0,
	categories: ["Lists","Newly Added"],
	visible: true,
	css: `
/*the priority field goes under "total rewatches", the notes make room for it*/
.list-editor-wrap .list-editor .body .priority{
	grid-area: priority;
}
.list-editor-wrap .list-editor .body .input-wrap.altoolkitHasPriority{
	grid-template-areas:
		"status score progress"
		"start finish repeat"
		"notes notes priority"
		"advanced advanced advanced";
}
.list-editor-wrap .list-editor .body .input-wrap.manga.altoolkitHasPriority{
	grid-template-areas:
		"status score progress"
		"start repeat volumes"
		"finish notes priority"
		"advanced advanced advanced";
}
.altoolkitPriority .el-input__inner{
	text-align: left;
}
`
})

if(useScripts.priorityInEditor && useScripts.accessToken){//saving needs the access token, AniList's own editor doesn't send the priority
	let PRIORITY_MAX = 3;//0 is unset
	let clampPriority = value => Math.min(PRIORITY_MAX,Math.max(0,parseInt(value) || 0));
	let buildField = function(){
		let form = create("div",["form","priority","altoolkitPriority"]);
		create("div","input-title","Priority",form);
		let number = create("div",["el-input-number","is-controls-right"],false,form);
		let decrease = create("span","el-input-number__decrease",false,number);
		create("i","el-icon-arrow-down",false,decrease);
		let increase = create("span","el-input-number__increase",false,number);
		create("i","el-icon-arrow-up",false,increase);
		let input = create("input","el-input__inner",false,create("div","el-input",false,number));
		input.type = "text";
		input.inputMode = "numeric";
		input.autocomplete = "off";
		let field = {mediaId: null,original: 0,value: 0};
		form.altoolkitField = field;
		let render = function(){
			input.value = field.value;
			decrease.classList.toggle("is-disabled",field.value <= 0);
			increase.classList.toggle("is-disabled",field.value >= PRIORITY_MAX)
		};
		let set = function(value){
			field.value = clampPriority(value);
			render()
		};
		decrease.addEventListener("click",() => set(field.value - 1));
		increase.addEventListener("click",() => set(field.value + 1));
		input.addEventListener("change",() => set(input.value));
		input.addEventListener("keydown",function(e){
			if(e.key === "ArrowUp"){
				e.preventDefault();
				set(field.value + 1)
			}
			else if(e.key === "ArrowDown"){
				e.preventDefault();
				set(field.value - 1)
			}
		});
		field.load = function(mediaId,priority){
			field.mediaId = mediaId;
			field.original = priority;
			set(priority)
		};
		field.read = () => set(input.value);//a value typed but not confirmed yet
		return form
	};
	let hookSaveButton = function(wrap,store){
		if(wrap.dataset.altoolkitPriority){
			return
		}
		wrap.dataset.altoolkitPriority = "1";
		wrap.addEventListener("click",function(e){
			if(!e.target.closest || !e.target.closest(".save-btn")){
				return
			}
			let form = wrap.querySelector(".altoolkitPriority");
			let field = form && form.altoolkitField;
			if(!field || field.mediaId === null){
				return
			}
			field.read();
			if(field.value === field.original){
				return
			}
			let mediaId = field.mediaId;
			let value = field.value;
			field.original = value;
			//AniList's own save doesn't know about priority, and runs at the same time, so this one waits a moment
			setTimeout(function(){
				authAPIcall(
					`mutation($mediaId:Int,$priority:Int){
						SaveMediaListEntry(mediaId:$mediaId,priority:$priority){
							id
						}
					}`,
					{mediaId: mediaId,priority: value},
					function(data){
						if(!data){
							return
						}
						try{
							store.dispatch("medialistEditor/fetch",mediaId)//refreshes the entry, so lists show the new priority
						}
						catch(err){
							console.error(err)
						}
					}
				)
			},800)
		},true)
	};
	let tick = function(){
		if(!useScripts.priorityInEditor){//switched off in the settings without reloading: take the field away again
			Array.from(document.querySelectorAll(".altoolkitPriority")).forEach(form => form.remove());
			Array.from(document.querySelectorAll(".altoolkitHasPriority")).forEach(inputWrap => inputWrap.classList.remove("altoolkitHasPriority"));
			return
		}
		let wrap = document.querySelector(".list-editor-wrap");
		let inputWrap = wrap && wrap.querySelector(".input-wrap");
		let notes = inputWrap && inputWrap.querySelector(".form.notes");
		let store = wrap && wrap.__vue__ && wrap.__vue__.$store;
		let editor = store && store.state.medialistEditor && store.state.medialistEditor.listEditor;
		if(!notes || !editor || !editor.active || !editor.mediaId){
			return
		}
		let entry = Object.values(store.state.entities.listEntry || {}).find(item => item.mediaId === editor.mediaId);
		let priority = entry && entry.priority || 0;
		let form = inputWrap.querySelector(".altoolkitPriority");
		if(!form){
			form = buildField();
			notes.parentNode.insertBefore(form,notes.nextSibling);
			inputWrap.classList.add("altoolkitHasPriority");
			hookSaveButton(wrap,store)
		}
		let field = form.altoolkitField;
		//the entry can arrive a moment after the editor opens, so it is read again until the field has been changed by hand
		if(field.mediaId !== editor.mediaId || (field.value === field.original && field.original !== priority)){
			field.load(editor.mediaId,priority)
		}
	};
	//run as soon as the editor is drawn (before the browser paints) and whenever the store gets the entry, so nothing pops in late
	let queued = false;
	new MutationObserver(function(){
		if(!queued){
			queued = true;
			queueMicrotask(function(){
				queued = false;
				tick()
			})
		}
	}).observe(document.body,{childList: true,subtree: true});
	let watchStore = setInterval(function(){
		let app = document.getElementById("app");
		let store = app && app.__vue__ && app.__vue__.$store;
		if(store){
			clearInterval(watchStore);
			store.subscribe(tick)
		}
	},200);
	setInterval(tick,1000)//in case both of the above missed it
}
