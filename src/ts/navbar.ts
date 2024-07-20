class SideNavBar {
    // constructor to call necessary functions
    constructor() {
        window.addEventListener("load", () => {
            (document.getElementById("toggle-side-nav") as HTMLImageElement)?.addEventListener("click", () => {
                this.toggleSideNav();
            });
            this.setSearchFunctionality();
            this.setSideNavBar();
        });
    }

    // function to set the search bar functionality (Ctrl + /)
    private setSearchFunctionality(): void {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "/") {
                (document.getElementById("search-box") as HTMLInputElement).focus();
            }
        });
    }

    // function to set the side navbar's state on load
    private setSideNavBar(): void {
        let isMinimised = sessionStorage.getItem("isMinimised") ? JSON.parse(sessionStorage.getItem("isMinimised")!) : false;
        if (isMinimised) {
            document.body.classList.add("side-nav-collapse");
        }
    }

    // function to toggle the side navbar's state
    private toggleSideNav(): void {
        let isMinimised = sessionStorage.getItem("isMinimised") ? JSON.parse(sessionStorage.getItem("isMinimised")!) : false;
        sessionStorage.setItem("isMinimised", isMinimised ? "false" : "true");
        document.body.classList.add("add-transition");
        document.body.classList.toggle('side-nav-collapse');
    }
}

new SideNavBar();