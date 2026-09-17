exportModule({
	id: "markdownHelp",
	description: "$markdown_help_description",
	isDefault: false,
	categories: ["Navigation"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return true
	},
	code: function(){
		let markdownHelper = document.getElementById("altoolkitMarkdownHelper");
		if(markdownHelper){
			return
		}
		markdownHelper = create("span","#altoolkitMarkdownHelper","</>?",document.getElementById("app"));
		markdownHelper.title = translate("$markdown_help_title");
		markdownHelper.onclick = function(){
			let existing = document.querySelector(".altoolkitDisplayBox");
			if(existing){
				existing.remove()
			}
			else{
				let disp = createDisplayBox("height: 600px;",translate("$markdown_help_title"));
				create("h3","altoolkitGuideHeading",translate("$markdown_help_images_header"),disp);
				create("pre","altoolkitCode","img(your link here)",disp);
				create("pre","altoolkitCode","img(https://i.stack.imgur.com/Wlvkk.jpg)",disp);
				create("p",false,translate("$markdown_help_imageUpload"),disp);
				create("p",false,translate("$markdown_help_imageSize"),disp);
				create("pre","altoolkitCode","img300(your link here)",disp);
				create("p",false,translate("$markdown_help_infixOr"),disp);
				create("pre","altoolkitCode","img40%(your link here)",disp);
				create("h3","altoolkitGuideHeading",translate("$markdown_help_links_header"),disp);
				create("pre","altoolkitCode","[link text](URL)",disp);
				create("pre","altoolkitCode","[cool show](https://en.wikipedia.org/wiki/Urusei_Yatsura)",disp);
				create("p",false,"To get a media preview card, just put the Anilist URL of the show:",disp);
				create("pre","altoolkitCode","https://anilist.co/anime/1293/Urusei-Yatsura/",disp);
				create("p",false,"To make an image a link, put the image markdown inside the link markdown, with a space on both sides",disp);
				create("pre","altoolkitCode","[ img(image URL) ](link URL)",disp);
				create("h3","altoolkitGuideHeading",translate("$markdown_help_formatting_header"),disp);
				create("h1",false,"headline",disp);
				create("pre","altoolkitCode","# headline",disp);
				create("i",false,"italics",disp);
				create("pre","altoolkitCode","*italics* or _italics_",disp);
				create("b",false,"bold",disp);
				create("pre","altoolkitCode","**bold** or __bold__",disp);
				create("del",false,"strikethrough",disp);
				create("pre","altoolkitCode","~~strikethrough~~",disp);
				create("span",false,"Use a backslash \\ to undo special meaning of formatting symols like * ~ # _ \\",disp);
				create("pre","altoolkitCode","Use a backslash \\\\ to undo special meaning of formatting symols like \\* \\~ \\# \\_ \\\\",disp);
				create("a",["link","altoolkitGuideHeading"],"Full guide",disp).href = "https://anilist.co/forum/thread/6125";
				create("span",false," ◆ ",disp);
				create("a",["link","altoolkitGuideHeading"],"Make emojis work",disp).href = "https://files.kiniro.uk/unicodifier.html";
			}
		}
	}
})
