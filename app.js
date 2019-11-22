const data = [];

for (let i = 0; i <= 1000; i++) {
    data.push({
        name: 'elad' + i,
        age: i
    });
}


const replaceData = [];
for (let i = 0; i <= 1000; i++) {
    replaceData.push({
        name: 'noy' + i,
        age: i
    });
}


const cols = [
    {
        header: 'Name',
        key: 'name',
        startSort: true,
        className: function (row, col) {
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
}


document.addEventListener('DOMContentLoaded', function (event) {


    table = new Table('#dataTable', options);

    table.start(data, cols);

});



const replace = () => {
    console.log('replace');
    console.log(replaceData)
    table.start(replaceData, cols);
}