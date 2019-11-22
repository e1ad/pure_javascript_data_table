class Table {


    constructor(target, options = {}) {

        this.target = typeof (target) == 'string' ? document.querySelector(target) : target;
        this.options = options;
        this.currentPage = 0;
        this.defaultRowHeight = 32;

        if (this.target) {
            this.table = document.createElement('table');
            this.footer = document.createElement('footer')
            this.table.appendChild(document.createElement('thead'));
            this.table.appendChild(document.createElement('tbody'));
            this.target.appendChild(this.table);
            this.target.appendChild(this.footer)
            this.pagination = new Pagination(this.footer);
            this.addClickListener();
        }

        ['onPageClick', 'onInputChanged', 'onSearchInputListener'].forEach(funName => {
            this[funName] = this[funName].bind(this)
        });

    }

    getMaxRows() {
        const tableHeight = this.target.getBoundingClientRect().height;
        if (this.options.maxRows) {
            return this.options.maxRows;
        }
        else if (tableHeight) {
            return Math.floor(tableHeight / this.defaultRowHeight);
        }
        return 10;
    }


    addClickListener() {
        this.table.addEventListener('click', event => {
            if (this.options && typeof (this.options.onRowClick) == 'function' && event.target.parentElement.attributes.index) {
                const rowIndex = Number(event.target.parentElement.attributes.index.value);
                if (this.data[rowIndex]) {
                    this.options.onRowClick(this.data[rowIndex]);
                }
            }
            if (event.target.attributes.action) {
                const action = event.target.attributes.action.value;
                if (typeof (this[action]) === 'function') {
                    this[action](event.target.attributes);
                }
            }
        });
    }


    findColByKey(colKey) {
        return this.cols.find(col => col.key === colKey);
    }


    sort(dir, colKey) {
        if (this.dir != dir || this.sortByCol != colKey) {
            const col = this.findColByKey(colKey);
            this.sortByCol = colKey;
            this.dir = dir;
            if (typeof (col.sort) == 'object' && col.sort.callBack) {
                this.data.sort(col.sort.callBack);
            } else {
                this.data.sort((a, b) => a[colKey] > b[colKey] ? dir : -1 * dir);
            }
            this.rederHeader();
            this.renderBody();
        }
    }


    sortUp(attributes) {
        this.sort(1, attributes.colKey.value);
    }


    sortDown(attributes) {
        this.sort(-1, attributes.colKey.value);
    }


    displayValue(row, col) {
        if (typeof (col.displayValue) === 'function') {
            return col.displayValue(row, col);
        }
        return row[col.key];
    }


    className(row, col) {
        switch (typeof (col.className)) {
            case 'string':
                return col.className;
            case 'function':
                return col.className(row, col);
            default:
                return ''
        }
    }


    sortArrowIcon(col, direction) {
        const actionName = direction === 1 ? 'sortUp' : 'sortDown';
        const icon = direction === 1 ? 'arrow_drop_up' : 'arrow_drop_down';
        return createElement('span', {
            class: `material-icons ${col.key == this.sortByCol && this.dir == direction ? 'selected' : ''}`,
            action: actionName,
            colKey: col.key
        }, icon);
    }

    addSortIcons(col) {
        const spanA2z = this.sortArrowIcon(col, 1);
        const spanZ2a = this.sortArrowIcon(col, -1);
        const divContainer = createElement('div', { class: 'sort' });
        divContainer.appendChild(spanA2z);
        divContainer.appendChild(spanZ2a);
        return divContainer;
    }


    onSearchInputListener(event) {
        this.currentPage = 0;
        this.pagination.setSelectedPage(this.currentPage);
        const colKey = event.target.attributes.colKey && event.target.attributes.colKey.value;
        this.searchValue = { 'value': event.target.value, 'colKey': colKey };
        this.renderBody();
    }


    searchAndFilter(data) {
        if (this.searchValue && this.searchValue.value) {
            const regex = new RegExp(this.searchValue.value, 'i');
            return this.data.filter(row => regex.test(row[this.searchValue.colKey]));
        }
        return data;
    }


    colSearchHeader(tr, col) {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.setAttribute('colKey', col.key);
        td.appendChild(input)
        tr.appendChild(td);
    }


    rederHeader() {
        this.removeInputListener('thead input', this.onSearchInputListener);
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const colSearchRow = document.createElement('tr');
        this.cols.forEach(col => {
            this.colSearchHeader(colSearchRow, col)
            const th = createElement('th', {}, col.header);
            if (col.sort === undefined || col.sort === true) {
                const addSortIcons = this.addSortIcons(col);
                th.appendChild(addSortIcons);
            }
            tr.appendChild(th);
        });
        thead.appendChild(colSearchRow);
        thead.appendChild(tr);
        this.table.querySelector('thead').replaceWith(thead);
        this.addInputListener('thead input', this.onSearchInputListener);
    }


    inputCell(col, value) {
        const attributs = Object.assign({}, col.input, { value, colKey: col.key });
        const input = createElement('input', attributs);
        return input;
    }


    renderCell(row, col) {
        const td = document.createElement('td');
        const className = this.className(row, col);
        if (className) {
            td.setAttribute('class', className);
        }
        const value = this.displayValue(row, col);
        let cellText;
        if (typeof (col.input) == 'object') {
            cellText = this.inputCell(col, value);
        }
        else {
            cellText = document.createTextNode(value);
        }
        td.appendChild(cellText);
        return td;
    }


    onInputChanged(event) {
        const index = Number(event.target.parentElement.parentElement.attributes.index && event.target.parentElement.parentElement.attributes.index.value);
        const colKey = event.target.attributes.colKey && event.target.attributes.colKey.value;
        if (this.data[index]) {
            this.data[index][colKey] = event.target.value;
            event.target.setAttribute('value', event.target.value);
        };
    }


    addInputListener(selector, func) {
        const inputs = this.table.querySelectorAll(selector);
        inputs.forEach(input => {
            input.addEventListener('input', func, false);
        });
    }


    removeInputListener(selector, func) {
        const inputs = this.table.querySelectorAll(selector);
        inputs.forEach(input => {
            input.removeEventListener('input', func, false);
        });
    }


    dataIndex(rowIndex) {
        return this.currentPage * this.maxRows + rowIndex;
    }


    currentPageData() {
        const offset = this.currentPage * this.maxRows;
        return this.searchAndFilter(this.data).slice(offset, offset + this.maxRows);
    }


    renderBody() {
        this.removeInputListener('tbody input', this.onInputChanged);
        const tbody = document.createElement('tbody');
        this.currentPageData().forEach((row, rowIndex) => {
            const tr = createElement('tr', { 'index': this.dataIndex(rowIndex) });
            this.cols.forEach((col) => {
                const td = this.renderCell(row, col);
                tr.appendChild(td);
            })
            tbody.appendChild(tr);
        });
        this.table.querySelector('tbody').replaceWith(tbody);
        this.addInputListener('tbody input', this.onInputChanged);
    }


    onPageClick(pageNumber) {
        this.currentPage = pageNumber;
        this.renderBody();
    }


    start(data, cols) {
        if (this.target) {
            this.target.setAttribute('class', 'data-table');
            this.data = data;
            this.cols = cols;
            setTimeout(() => {
                this.maxRows = this.getMaxRows();
                this.pagination.start(this.data.length, this.maxRows, this.onPageClick);
                this.rederHeader();
                this.renderBody();
            }, 0);
        }
    }


}
