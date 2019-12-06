class Table {

    constructor(target, options = {}) {

        this.target = isString(target) ? document.querySelector(target) : target;
        this.options = options;
        this.currentPage = 0;
        this.tableClickDestory = noop;

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

        ['onPageClick', 'onInputChanged', 'onSearchInput'].forEach(funName => {
            this[funName] = this[funName].bind(this)
        });

    }

    getMaxRows() {
        const tableHeight = this.target.getBoundingClientRect().height;
        const moreRows = 2; //header and search rows
        if (this.options.maxRows) {
            return this.options.maxRows;
        }
        else if (tableHeight) {
            return Math.floor(tableHeight / Table.DEFAULT_ROW_HEIGHT) - moreRows;
        }
        return Table.DEFAULT_MAX_ROWS;
    }


    addClickListener() {
        this.tableClickDestory = createEventListener(this.table, 'click', event => {
            if (this.options && isFunction(this.options.onRowClick) && event.target.parentElement.attributes.index) {
                const rowIndex = Number(event.target.parentElement.attributes.index.value);
                if (this.data[rowIndex]) {
                    this.options.onRowClick(this.data[rowIndex]);
                }
            }
            if (event.target.attributes.action) {
                const action = event.target.attributes.action.value;
                if (isFunction(this[action])) {
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
        if (isFunction(col.displayValue)) {
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
                return '';
        }
    }


    sortArrowIcon(col, direction) {
        const icon = direction === 1 ? Table.SORT_UP_ICON : Table.SORT_DOWN_ICON;
        return createElement('span', {
            class: `material-icons ${col.key == this.sortByCol && this.dir == direction ? 'selected' : ''}`,
            action: direction === 1 ? 'sortUp' : 'sortDown',
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


    onSearchInput(event) {
        this.currentPage = 0;
        this.pagination.setSelectedPage(this.currentPage);
        const colKey = event.target.attributes.colKey && event.target.attributes.colKey.value;
        this.searchValue = { 'value': event.target.value, 'colKey': colKey };
        this.renderBody();
    }


    searchAndFilter(data) {
        if (this.searchValue && this.searchValue.value) {
            const regex = new RegExp(this.searchValue.value, 'i');
            const _data = this.data.filter(row => regex.test(row[this.searchValue.colKey]));
            this.pagination.setTotalPages(_data.length, this.currentPage);
            return _data;
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
        this.removeInputListener(this.onSearchInputListener);
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
        this.onSearchInputListener = this.addInputListener('thead input', this.onSearchInput);
    }


    inputCell(col, value) {
        const attributs = Object.assign({}, col.input, { value, colKey: col.key });
        return createElement('input', attributs);
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


    removeInputListener(destoryInputListeners) {
        forEach(destoryInputListeners, destoryInputListener => destoryInputListener());
    }


    addInputListener(selector, func) {
        const inputs = this.table.querySelectorAll(selector);
        return [...inputs].map(input => {
            return createEventListener(input, 'input', func);
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
        this.removeInputListener(this.destoryInputListeners);
        const tbody = document.createElement('tbody');
        const data = this.currentPageData();
        data.forEach((row, rowIndex) => {
            const tr = createElement('tr', { 'index': this.dataIndex(rowIndex) });
            this.cols.forEach((col) => {
                const td = this.renderCell(row, col);
                tr.appendChild(td);
            })
            tbody.appendChild(tr);
        });
        this.table.querySelector('tbody').replaceWith(tbody);
        this.destoryInputListeners = this.addInputListener('tbody input', this.onInputChanged);
    }


    onPageClick(pageNumber) {
        this.currentPage = pageNumber;
        this.renderBody();
    }


    reset() {
        this.searchValue = '';
        this.currentPage = 0;
    }


    start(data, cols) {
        if (this.target) {
            this.target.setAttribute('class', Table.TABLE_CLASS_NAME);
            this.data = data;
            this.cols = cols;
            this.reset();
            setTimeout(() => {
                this.maxRows = this.getMaxRows();
                this.pagination.start(this.data.length, this.maxRows, this.onPageClick);
                this.rederHeader();
                this.renderBody();
            }, 0);
        }
    }

    destroy() {
        this.tableClickDestory();
        this.removeInputListener(this.onSearchInputListener);
        this.removeInputListener(this.destoryInputListeners);
        this.pagination.destroy();
    }

}


Table.TABLE_CLASS_NAME = 'data-table'
Table.SORT_UP_ICON = 'arrow_drop_up';
Table.SORT_DOWN_ICON = 'arrow_drop_down';
Table.DEFAULT_MAX_ROWS = 10;
Table.DEFAULT_ROW_HEIGHT = 32;