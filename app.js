import { Table } from './components/table/table.js';

const data = [];

for (let i = 0; i <= 1000; i++) {
    data.push({
        name: 'elad' + i,
        age: i,
        address: i + 'adress'
    });
}


const replaceData = [];

for (let i = 0; i <= 10; i++) {
    replaceData.push({
        name: 'noy' + i,
        age: i,
        address: i + 'adress'
    });
}


const cols = [
    {
        header: 'Name',
        key: 'name',
        className: (row, col) => {
            return row[col.key] == 'elad1' ? 'test' : '';
        },
        sort: true
    },
    {
        header: 'Age',
        key: 'age',
        input: {
            type: 'text'
        }
    },
    {
        header: 'Adress',
        key: 'address',
    },

]


let table;


const options = {
    searchFields: true,
    onRowClick: (row, event) => {
        console.log(row, event);
    },
    onInputChange: (row) => {
        console.log(row);
    }
}


document.addEventListener('DOMContentLoaded', (event) => {


    table = new Table('#dataTable', options);

    table.start(data, cols);

});



const replace = () => {
    table.start(replaceData, cols);
}
