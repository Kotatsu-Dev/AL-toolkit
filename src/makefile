SHELL := /bin/bash
EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if $(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'. If you are unable to install it, there are complete builds of AL-toolkit at https://github.com/Kotatsu-Dev/AL-toolkit/releases")))

all: pre-build build build/al-toolkit.user.js build/firefox_addon.zip post-build

pre-build:
	rm -f build/userModules.js

build/al-toolkit.user.js: al-toolkit.m4 settings.js alias.js css/global.css conditionalStyles.js utilities.js purify.js graphql.js localisation.js controller.js build/userModules.js HOWTO.js
	m4 --prefix-builtins al-toolkit.m4 > build/al-toolkit.user.js
	date +"%s" | sed 's_^_//AL-toolkit built at _' >> build/al-toolkit.user.js

build/userModules.js: modules
	for module in modules/*; do\
	    echo "//begin $$module";\
	    cat "$$module";\
	    echo "//end $$module";\
	done > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/al-toolkit.user.js ../icons manifest.json
	$(info )
	$(info Creating Firefox addon)
	cd build && cp -rp ../../icons/ icons/ && cp -p ../manifest.json . && cp -p al-toolkit.user.js al-toolkit.js && \
	zip -FS firefox_addon.zip -r al-toolkit.js icons/ manifest.json && rm -fr icons manifest.json al-toolkit.js

post-build:
	$(info )
	$(info AL-toolkit build completed)
	$(info The compiled script is in /src/build/)
