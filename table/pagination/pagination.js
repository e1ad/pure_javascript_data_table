import {createElement, isFunction, noop, createEventListener, isNumber} from './../../commons.js';

export class Pagination {

    static SELECTED_ATTR = 'selected';
    static PAGE_NUMBER_CLASS = 'page-number';
    static NAV_NEXT_ICON = 'navigate_next';
    static NAV_PREVIOUS_ICON = 'navigate_before';

    constructor(target) {
        this.tableClickDestory = noop;

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
        this.tableClickDestory = createEventListener(this.target, 'click', (event) => {
            if (event.target.nodeName === 'LI') {

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
        const max = (stackPage + 1) * maxPages;
        return {
            min: stackPage < 0 ? 0 : stackPage * maxPages,
            max: max < this.pages ? max : this.pages
        };
    }


    createNavIcon(action) {
        const icon = action === 'previous' ? Pagination.NAV_PREVIOUS_ICON : Pagination.NAV_NEXT_ICON;
        return createElement('li', {action: action, class: 'material-icons'}, icon);
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
        const {min, max} = this.minAndMax();
        const ul = createElement('ul');
        this.addPreviousNav(ul)
        for (let i = min; i < max; i++) {
            const li = createElement('li', {class: Pagination.PAGE_NUMBER_CLASS}, i + 1);
            ul.appendChild(li);
        }
        this.addNextNav(ul)
        this.target.querySelector('ul').replaceWith(ul);
    }


    setSelectedPage(currentPage) {
        if (isNumber(currentPage)) {
            this.currentPage = currentPage;
        }

        this.target.querySelectorAll('ul > li').forEach(li => {
            const pageNumber = Number(li.innerText) - 1;

            if (pageNumber === this.currentPage) {
                li.classList.add(Pagination.SELECTED_ATTR);
            } else if (li.className.indexOf(Pagination.SELECTED_ATTR) > -1) {
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

    destroy() {
        this.tableClickDestory();
    }

}
