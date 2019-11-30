class Pagination {

    constructor(target) {
        if (target) {
            this.target = target;
            this.maxPages = 12;
            this.currentPage = 0;
            this.target.appendChild(document.createElement('ul'));
            this.target.setAttribute('class', 'pagination');
            this.addClickListener();
        }
    }


    addClickListener() {
        this.target.addEventListener('click', (event) => {
            if (event.target.nodeName == 'LI') {
                if (event.target.className.indexOf(Pagination.PAGE_NUMBER_CLASS) > -1 && isFunction(this.onClick)) {
                    const currentPage = Number(event.target.innerText) - 1;
                    this.setSelectedPage(currentPage);
                    this.onClick(currentPage);
                }
                if (event.target.attributes.action) {
                    const action = event.target.attributes.action.value;
                    if (isFunction(this[action])) {
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
        if (isFunction(this.onClick)) {
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


    createNavIcon(action) {
        const icon = action === 'previous' ? 'navigate_before' : 'navigate_next';
        return createElement('li', { action: action, class: 'material-icons' }, icon);
    }

    addPreviousNav(ul) {
        if (this.pages > this.maxPages) {
            const li = this.createNavIcon('previous');
            ul.appendChild(li);
        }
    }


    addNextNav(ul) {
        if (this.currentPage < this.pages) {
            const li = this.createNavIcon('next');
            ul.appendChild(li);
        }
    }


    renderPages() {
        const { min, max } = this.minAndMax();
        const ul = document.createElement('ul');
        this.addPreviousNav(ul)
        for (let i = min; i < max; i++) {
            const li = createElement('li', { class: Pagination.PAGE_NUMBER_CLASS }, i + 1);
            ul.appendChild(li);
        }
        this.addNextNav(ul)
        this.target.querySelector('ul').replaceWith(ul);
    }


    setSelectedPage(currentPage) {
        if (typeof (currentPage) === 'number') {
            this.currentPage = currentPage;
        }
        const lis = this.target.querySelectorAll('ul > li');
        lis.forEach(li => {
            const pageNumber = Number(li.innerText) - 1;
            if (pageNumber == this.currentPage) {
                li.classList.add(Pagination.SELECTED_ATTR);
            }
            else if (li.className.indexOf(Pagination.SELECTED_ATTR) > -1) {
                li.classList.remove(Pagination.SELECTED_ATTR);
            }
        });
    }


    setTotalPages(total, currentPage = 0) {
        this.total = total;
        this.renderPages();
        this.setSelectedPage(currentPage);
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


Pagination.SELECTED_ATTR = 'selected';
Pagination.PAGE_NUMBER_CLASS = 'page-number';