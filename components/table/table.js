import {
    createElement,
    isFunction,
    isString,
    isElement,
    createEventListener,
    forEach,
    noop,
    bindAll
} from '../commons.js';
import {Pagination} from '../pagination/pagination.js'

export class Table {

    static TABLE_CLASS_NAME = 'data-table'
    static SORT_UP_ICON = 'arrow_drop_up';
    static SORT_DOWN_ICON = 'arrow_drop_down';
    static DEFAULT_MAX_ROWS = 10;
    static DEFAULT_ROW_HEIGHT = 32;

    constructor(target, options = {}) {

        this.target = isString(target) ? document.querySelector(target) : target;
        this.options = options;
        this.currentPage = 0;
        this.tableClickDestory = noop;

        if (isElement(this.target)) {
            this.table = createElement('div', {class: 'table'}, [
                createElement('thead', {class: 'thead'}),
                createElement('div', {class: 'tbody'})
            ]);

            this.footer = createElement('div', {class: 'footer'})
            this.target.appendChild(this.table);
            this.target.appendChild(this.footer)
            this.pagination = new Pagination(this.footer);
            this.addClickListener();
        }

        bindAll(['onPageClick', 'onInputChanged', 'onSearchInput'], this);
    }

    getMaxRows() {
        const tableHeight = this.target.getBoundingClientRect().height;
        const moreRows = 2; //header and search rows
        if (this.options.maxRows) {
            return this.options.maxRows;
        } else if (tableHeight) {
            return Math.floor(tableHeight / Table.DEFAULT_ROW_HEIGHT) - moreRows;
        }

        return Table.DEFAULT_MAX_ROWS;
    }

    addClickListener() {
        this.tableClickDestory = createEventListener(this.table, 'click', event => {

            const indexAttr = event.target.parentElement.attributes.index;
            if (this.options && isFunction(this.options.onRowClick) && indexAttr) {
                const rowIndex = Number(indexAttr.value);
                if (this.data[rowIndex]) {
                    this.options.onRowClick(this.data[rowIndex], event);
                }
            }

            const actionAttr = event.target.attributes.action;
            if (actionAttr) {
                const action = actionAttr.value;
                if (isFunction(this[action])) {
                    this[action](event.target.attributes);
                }
            }
        });
    }

    findColByKey(colKey) {
        return this.cols.find(col => col.key === colKey);
    }

    getSortCallback(col) {
        if (typeof (col.sort) === 'object' && col.sort.callBack) {
            return col.sort.callBack;
        }

        return (a, b) => a[col.key] > b[col.key] ? this.dir : -1 * this.dir
    }

    sort(dir, colKey) {
        if (this.dir !== dir || this.sortByCol !== colKey) {
            const col = this.findColByKey(colKey);
            this.sortByCol = colKey;
            this.dir = dir;
            this.data.sort(this.getSortCallback(col));
            this.renderHeader();
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
            class: `material-icons ${col.key === this.sortByCol && this.dir === direction ? 'selected' : ''}`,
            action: direction === 1 ? 'sortUp' : 'sortDown',
            colKey: col.key
        }, icon);
    }

    addSortIcons(col) {
        return createElement('div', {class: 'sort'}, [
            this.sortArrowIcon(col, 1),
            this.sortArrowIcon(col, -1)
        ]);
    }

    onSearchInput(event) {
        this.currentPage = 0;
        this.pagination.setSelectedPage(this.currentPage);
        const colKey = event.target.attributes.colKey && event.target.attributes.colKey.value;
        this.searchValue = {'value': event.target.value, 'colKey': colKey};
        this.renderBody();
    }

    searchAndFilter(data) {
        if (this.searchValue && this.searchValue.value) {
            const value = this.searchValue.value.toLowerCase();
            const filteredData = this.data.filter(row => String(row[this.searchValue.colKey]).toLowerCase().includes(value));
            this.pagination.setTotalPages(filteredData.length, this.currentPage);

            return filteredData;
        }

        return data;
    }

    colSearchHeader(col) {
        return createElement('div', {class: 'td'}, [
            createElement('input', {colKey: col.key})
        ]);
    }

    isSortable(col) {
        return col.sort === undefined || col.sort === true;
    }

    renderHeader() {
        let colSearchRow;

        if (this.options.searchFields) {
            this.removeInputListener(this.onSearchInputListener);
            colSearchRow = createElement('div', {class: 'tr'});
        }

        const ths = this.cols.map(col => {

            if (this.options.searchFields) {
                colSearchRow.appendChild(this.colSearchHeader(col))
            }

            const addSortIcons = this.isSortable(col) ? this.addSortIcons(col) : undefined;
            return createElement('div', {class: 'th'}, [col.header, addSortIcons]);
        });


        const thead = createElement('div', {class: 'thead'}, [
            colSearchRow,
            createElement('div', {class: 'tr'}, ths)
        ]);

        this.table.querySelector('.thead').replaceWith(thead);
        if (this.options.searchFields) {
            this.onSearchInputListener = this.addInputListener('.thead input', this.onSearchInput);
        }
    }

    inputCell(col, value) {
        const attributs = Object.assign({}, col.input, {value, colKey: col.key});
        return createElement('input', attributs);
    }

    cellContent(row, col) {
        const value = this.displayValue(row, col);

        if (typeof (col.input) == 'object') {
            return this.inputCell(col, value);
        }

        return document.createTextNode(value);
    }

    renderCell(row, col) {
        const className = this.className(row, col);
        const cellContent = this.cellContent(row, col);
        const td = createElement('div', {class: `td ${className ? className : ''}`});
        td.appendChild(cellContent);

        return td;
    }

    onInputChanged(event) {
        const indexAttr = event.target.parentElement.parentElement.attributes.index;
        const index = Number(indexAttr && indexAttr.value);
        const colKeyAttr = event.target.attributes.colKey
        const value = event.target.value;
        const row = this.data[index];

        if (row) {
            row[colKeyAttr.value] = value;
            event.target.setAttribute('value', value);

            if (isFunction(this.options.onInputChange)) {
                this.options.onInputChange(row);
            }
        }
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
        const data = this.currentPageData();

        const trs = data.map((row, rowIndex) => {
            const tds = this.cols.map(col => this.renderCell(row, col));
            return createElement('div', {class: 'tr', index: this.dataIndex(rowIndex)}, tds);
        });

        const tbody = createElement('div', {class: 'tbody'}, trs);
        this.table.querySelector('.tbody').replaceWith(tbody);
        this.destoryInputListeners = this.addInputListener('.tbody input', this.onInputChanged);
    }

    onPageClick(pageNumber) {
        this.currentPage = pageNumber;
        this.renderBody();
    }

    reset() {
        this.searchValue = '';
        this.currentPage = 0;
    }

    onDomReady() {
        this.maxRows = this.getMaxRows();
        this.pagination.start(this.data.length, this.maxRows, this.onPageClick);
        this.renderHeader();
        this.renderBody();
    }

    start(data, cols) {
        if (isElement(this.target)) {
            this.target.setAttribute('class', Table.TABLE_CLASS_NAME);
            this.data = data;
            this.cols = cols;
            this.reset();
            setTimeout(this.onDomReady.bind(this), 0);
        }
    }

    destroy() {
        this.tableClickDestory();
        this.removeInputListener(this.onSearchInputListener);
        this.removeInputListener(this.destoryInputListeners);
        this.pagination.destroy();
    }

}
