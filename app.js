const data = [];

for (let i = 0; i <= 1000; i++) {
    data.push({
        name: 'elad' + i,
        age: i
    });
}


const replaceData = [];

for (let i = 0; i <= 10; i++) {
    replaceData.push({
        name: 'noy' + i,
        age: i
    });
}


const cols = [
    {
        header: 'Name',
        key: 'name',
        className: (row, col) => {
            return row[col.key] == 'elad1' ? 'test' : '';
        }
    },
    {
        header: 'Age',
        key: 'age',
        input: {
            type: 'text'
        }
    },

]


let table;


const options = {
    onRowClick: (row) => {
        console.log(row);
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