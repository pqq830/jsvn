var savescreen = new class extends Screen {

	constructor() {
		super(document.querySelector(".save.screen"));
	}
	
	showPage(page) {
		const currentPage = document.querySelector(".save.screen .page-viewer > .pages > *.visible");
		const targetPage = document.querySelector("#save-page-" + page);
		
		const children = [...currentPage.parentElement.children];
		
		const currentPageIndex = children.indexOf(currentPage);
		const targetPageIndex = children.indexOf(targetPage);
		
		if(targetPageIndex > currentPageIndex) {
			currentPage.classList.add("exit-to-left");
			targetPage.classList.add("visible");
			targetPage.classList.add("enter-from-right");
		} else if(targetPageIndex < currentPageIndex) {
			currentPage.classList.add("exit-to-right");
			targetPage.classList.add("visible");
			targetPage.classList.add("enter-from-left");
		} else {
			return;
		}
		Promise.all(currentPage.getAnimations().map(a => a.finished)).then(() => {
			currentPage.classList.remove("visible");
			if(targetPageIndex > currentPageIndex) {
				currentPage.classList.remove("exit-to-left");
			} else {
				currentPage.classList.remove("exit-to-right");
			}
		});
		
		Promise.all(targetPage.getAnimations().map(a => a.finished)).then(() => {
			if(targetPageIndex > currentPageIndex) {
				targetPage.classList.remove("enter-from-right");
			} else {
				targetPage.classList.remove("enter-from-left");
			}
		});
	}
};