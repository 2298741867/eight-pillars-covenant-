PORT ?= 8000
HOST ?= 0.0.0.0
SITE_URL ?= https://2298741867.github.io/eight-pillars-covenant-/

.PHONY: serve build test deploy

serve:
	PORT=$(PORT) HOST=$(HOST) node dev-server.js

build:
	SITE_URL=$(SITE_URL) CUSTOM_DOMAIN=$(CUSTOM_DOMAIN) node build-site.js

test:
	node validate-site.js

deploy:
	SITE_URL=$(SITE_URL) CUSTOM_DOMAIN=$(CUSTOM_DOMAIN) node build-site.js
	@echo "Commit and push to main to trigger .github/workflows/github-pages.yml"
	@echo "Shalom ❤️"
