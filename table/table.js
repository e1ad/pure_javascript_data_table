class Table {


    constructor(target, options) {

        this.target = typeof (target) == "string" ? document.querySelector(target) : target;
        this.options = options;
        this.currentPage = 0;
        this.maxRows = 10;

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

        this.onPageClick = this.onPageClick.bind(this);
        this.onInputChanged = this.onInputChanged.bind(this);

    }



    addClickListener() {
        this.table.addEventListener("click", event => {
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


    sort(dir, colKey) {
        this.sortByCol = colKey;
        this.dir = dir;
        this.data.sort((a, b) => {
            return a[colKey] > b[colKey] ? dir : -1 * dir;
        });
        this.rederHeader();
        this.renderBody();
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
            case "string":
                return col.className;
            case "function":
                return col.className(row, col);
            default:
                return ""
        }
    }


    addSortIcons(col) {
        const spanA2z = createElement('span', {
            "class": `material-icons ${col.key == this.sortByCol && this.dir == 1 ? 'selected' : ''}`,
            "action": "sortUp",
            "colKey": col.key
        }, "arrow_drop_up");
        const spanZ2a = createElement('span', {
            "class": `material-icons ${col.key == this.sortByCol && this.dir == -1 ? 'selected' : ''}`,
            "action": "sortDown",
            "colKey": col.key
        }, "arrow_drop_down");
        const divContainer = createElement("div", { "class": "sort" });
        divContainer.appendChild(spanA2z);
        divContainer.appendChild(spanZ2a);
        return divContainer;
    }


    rederHeader() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        thead.appendChild(tr);
        this.cols.forEach((col) => {
            const th = createElement('th', {}, col.header);
            if (col.sort === undefined || col.sort === true) {
                const addSortIcons = this.addSortIcons(col);
                th.appendChild(addSortIcons);
            }
            tr.appendChild(th);
        });
        this.table.querySelector("thead").replaceWith(thead);
    }


    inputCell(col, value) {
        const attributs = Object.assign({}, col.input, { "value": value, "colKey": col.key });
        const input = createElement("input", attributs);
        return input;
    }


    renderCell(row, col) {
        const td = document.createElement('td');
        const className = this.className(row, col);
        if (className) {
            td.setAttribute("class", className);
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
            event.target.setAttribute("value", event.target.value);
        };
    }


    addInputListers() {
        const inputs = this.table.querySelectorAll("tbody input");
        inputs.forEach(input => {
            input.addEventListener("input", this.onInputChanged, false);
        });
    }


    removeEventListers() {
        const inputs = this.table.querySelectorAll("tbody input");
        inputs.forEach(input => {
            input.removeEventListener("input", this.onInputChanged, false);
        });
    }


    dataIndex(rowIndex) {
        return this.currentPage * this.maxRows + rowIndex;
    }


    currentPageData() {
        const offset = this.currentPage * this.maxRows;
        return this.data.slice(offset, offset + this.maxRows);
    }


    renderBody() {
        this.removeEventListers();
        const tbody = document.createElement('tbody');
        this.currentPageData().forEach((row, rowIndex) => {
            const tr = createElement('tr', { "index": this.dataIndex(rowIndex) });
            this.cols.forEach((col) => {
                const td = this.renderCell(row, col);
                tr.appendChild(td);
            })
            tbody.appendChild(tr);
        });
        this.table.querySelector("tbody").replaceWith(tbody);
        this.addInputListers();
    }


    onPageClick(pageNumber) {
        this.currentPage = pageNumber;
        this.renderBody();
    }


    start(data, cols) {
        if (this.target) {
            this.target.setAttribute("class", "data-table")
            this.data = data;
            this.cols = cols;
            this.pagination.start(this.data.length, this.maxRows, this.onPageClick);
            this.rederHeader();
            this.renderBody();
        }
    }



}


