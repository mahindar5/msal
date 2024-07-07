document.getElementById('fileButton').addEventListener('click', async () => {
    const [fileHandle] = await window.showOpenFilePicker({
        types: [{
            description: 'CSV Files',
            accept: { 'text/csv': ['.csv'] }
        }],
        id: 'filePickerVis',
        multiple: false
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    parseCSV(text);
});

function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim());
    const delimiter = '~';

    // Ignore the sep=~ line if present
    if (lines[0].startsWith('sep=')) {
        lines.shift();
    }

    const headers = lines[0].split(delimiter).map(header => header.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(value => value.trim());
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i];
            return obj;
        }, {});
    });

    console.log('Parsed Data:', data); // Debugging: Log parsed data
    visualizeData(data);
}

function visualizeData(data) {
    if (data.length === 0) {
        console.error('No data found');
        return;
    }

    data.sort((a, b) => new Date(a['dateTime']) - new Date(b['dateTime']));
    data.forEach(row => row.totalCost = row.totalCost / 100);

    // Group data by date
    const groupedByDate = data.reduce((acc, row) => {
        const date = row['dateTime'].split('T')[0];
        if (!acc[date]) {
            acc[date] = { totalCost: 0, quantity: 0, totalCost: 0, weight: 0 };
        }
        acc[date].totalCost += parseFloat(row['totalCost']) || 0;
        acc[date].quantity += parseFloat(row['quantity']) || 0;
        acc[date].totalCost += parseFloat(row['totalCost']) || 0;
        acc[date].weight += parseFloat(row['weight']) || 0;
        return acc;
    }, {});

    const dates = Object.keys(groupedByDate);
    const totalCosts = dates.map(date => groupedByDate[date].totalCost);
    const quantities = dates.map(date => groupedByDate[date].quantity);

    createChart('chart1', 'line', dates, totalCosts, 'Total Cost over Time');
    createChart('chart2', 'line', dates, quantities, 'Total Quantity over Time');

    // Group data by store
    const groupedByStore = data.reduce((acc, row) => {
        const store = row['storeName'];
        if (!acc[store]) {
            acc[store] = { totalCost: 0 };
        }
        acc[store].totalCost += parseFloat(row['totalCost']) || 0;
        return acc;
    }, {});

    const stores = Object.keys(groupedByStore);
    const storeCosts = stores.map(store => groupedByStore[store].totalCost);

    createChart('chart3', 'bar', stores, storeCosts, 'Total Cost by Store');

    // Group data by product name for quantity distribution and average price
    const groupedByProduct = data.reduce((acc, row) => {
        const product = row['productName'];
        if (!acc[product]) {
            acc[product] = { quantity: 0, totalCost: 0, count: 0 };
        }
        acc[product].quantity += parseFloat(row['quantity']) || 0;
        acc[product].totalCost += parseFloat(row['totalCost']) || 0;
        acc[product].count += 1;
        return acc;
    }, {});

    const products = Object.keys(groupedByProduct);
    const productPrices = products.map(product => groupedByProduct[product].totalCost);

    // Add Product Price Distribution Pie Chart
    createChart('chart4', 'bar', products, productPrices, 'Average Price per Product');
    createChart('chart5', 'pie', products, productPrices, 'Product Price Distribution');
}

function createChart(chartId, type, labels, data, title) {
    new Chart(document.getElementById(chartId), {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

function createHistogram(chartId, data, title) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data,
            datasets: [{
                label: title,
                data: data
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Weight'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
}

function createScatterChart(chartId, data1, data2, title) {
    new Chart(document.getElementById(chartId), {
        type: 'scatter',
        data: {
            datasets: [{
                label: title,
                data: data1.map((value, index) => ({ x: value, y: data2[index] }))
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Total Cost'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                }
            }
        }
    });
}