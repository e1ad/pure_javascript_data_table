class Pagination {

    constructor(target) {
        if (target) {
            this.target = target;
            this.maxPages = 12;
            this.currentPage = 0;
            this.target.appendChild(document.createElement('ul'));
            this.target.setAttribute("class", "pagination");
            this.addClickListener();
        }
    }


    addClickListener() {
        this.target.addEventListener("click", (event) => {
            if (event.target.nodeName == "LI") {
                if (event.target.className.indexOf("page-number") > -1 && typeof (this.onClick) === 'function') {
                    const currentPage = Number(event.target.innerText) - 1;
                    this.setSelectedPage(currentPage);
                    this.onClick(currentPage);
                }
                if (event.target.attributes.action) {
                    const action = event.target.attributes.action.value;
                    if (typeof (this[action]) === 'function') {
                        this[action]();
                    }
                }
            }
        });
    }


    previous() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.onNav();
        }
    }


    next() {
        if (this.currentPage < this.pages) {
            this.currentPage++;
            this.onNav();
        }
    }


    onNav() {
        this.renderPages();
        this.setSelectedPage();
        if (typeof (this.onClick) === 'function') {
            this.onClick(this.currentPage);
        }
    }


    get pages() {
        return Math.ceil(this.total / this.maxRows);
    }


    get getMaxPages() {
        return this.pages < this.maxPages ? this.pages : this.maxPages;
    }


    minAndMax() {
        const maxPages = this.getMaxPages;
        const stackPage = Math.ceil((this.currentPage + 1) / maxPages) - 1;
        const min = stackPage < 0 ? 0 : stackPage * maxPages;
        let max = (stackPage + 1) * maxPages;
        max = max < this.pages ? max : this.pages;
        return { min, max };
    }


    addPreviousNav(ul) {
        if (this.pages > this.maxPages) {
            const li = createElement('li', { "action": "previous", "class": "material-icons" }, "navigate_before");
            ul.appendChild(li);
        }
    }


    addNextNav(ul) {
        if (this.currentPage < this.pages) {
            const li = createElement('li', { "action": "next", "class": "material-icons" }, "navigate_next");;
            ul.appendChild(li);
        }
    }


    renderPages() {
        const { min, max } = this.minAndMax();
        const ul = document.createElement('ul');
        this.addPreviousNav(ul)
        for (let i = min; i < max; i++) {
            const li = createElement('li', { "class": "page-number" }, i + 1);
            ul.appendChild(li);
        }
        this.addNextNav(ul)
        this.target.querySelector("ul").replaceWith(ul);
    }


    setSelectedPage(currentPage) {
        if (typeof (currentPage) === 'number') {
            this.currentPage = currentPage;
        }
        const lis = this.target.querySelectorAll("ul > li");
        lis.forEach(li => {
            const pageNumber = Number(li.innerText) - 1;
            if (pageNumber == this.currentPage) {
                li.classList.add("selected");
            }
            else if (li.className.indexOf("selected") > -1) {
                li.classList.remove("selected");
            }
        });
    }


    start(total, maxRows, onClick) {
        if (this.target && total && maxRows) {
            this.total = total;
            this.onClick = onClick;
            this.maxRows = maxRows;
            this.renderPages();
            this.setSelectedPage();
        }
    }


}
