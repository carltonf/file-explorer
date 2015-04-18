# Simple Makefile to ease some development tasks:

prep:
	@echo "** Browser-side libraries (Bower) update ..."
	bower install
	@echo "** Node-side libraries (NPM) update ..."
	npm install
	@echo "** DONE"

# as stub and also used for my own purpose
deploy:
	@echo "** Deploying to running site..."

	@cd .. ;\
	  rsync -vuzr --delete --exclude=.git/ file-explorer ~/Public/ 

	@echo "** DONE"
