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

function normalizeData(data) {
    return data.map(row => ({
        ...row,
        dateTime: new Date(row.dateTime),
        totalCost: parseFloat(row.totalCost) / 100 || 0,
        quantity: parseFloat(row.quantity) || 0,
        weight: parseFloat(row.weight) || 0
    }));
}

function groupDataBy(data, key, reducer) {
    return data.reduce((acc, row) => {
        const keyValue = key === 'dateTime' ? row[key].toISOString().split('T')[0] : row[key];
        if (!acc[keyValue]) {
            acc[keyValue] = reducer.initialValue();
        }
        reducer.accumulate(acc[keyValue], row);
        return acc;
    }, {});
}

function createAndDisplayCharts(groupedByDate, groupedByStore, groupedByProduct) {
    const dates = Object.keys(groupedByDate);
    createChart('chart1', 'line', dates, dates.map(date => groupedByDate[date].totalCost), 'Total Cost over Time');
    createChart('chart2', 'line', dates, dates.map(date => groupedByDate[date].quantity), 'Total Quantity over Time');

    const stores = Object.keys(groupedByStore);
    createChart('chart3', 'bar', stores, stores.map(store => groupedByStore[store].totalCost), 'Total Cost by Store');

    const products = Object.keys(groupedByProduct).sort((a, b) => groupedByProduct[b].totalCost - groupedByProduct[a].totalCost);
    createChart('chart4', 'bar', products, products.map(product => groupedByProduct[product].totalCost), 'Average Price per Product');
    createChart('chart5', 'pie', products, products.map(product => groupedByProduct[product].totalCost), 'Product Price Distribution');
}

function visualizeData(data) {
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid or no data found');
        return;
    }

    const normalizedData = normalizeData(data);

    const groupedByDate = groupDataBy(normalizedData, 'dateTime', {
        initialValue: () => ({ totalCost: 0, quantity: 0, weight: 0 }),
        accumulate: (acc, row) => {
            acc.totalCost += row.totalCost;
            acc.quantity += row.quantity;
            acc.weight += row.weight;
        }
    });

    const groupedByStore = groupDataBy(normalizedData, 'storeName', {
        initialValue: () => ({ totalCost: 0 }),
        accumulate: (acc, row) => acc.totalCost += row.totalCost
    });

    const groupedByProduct = groupDataBy(normalizedData, 'productName', {
        initialValue: () => ({ quantity: 0, totalCost: 0, count: 0 }),
        accumulate: (acc, row) => {
            acc.quantity += row.quantity;
            acc.totalCost += row.totalCost;
            acc.count += 1;
        }
    });

    createAndDisplayCharts(groupedByDate, groupedByStore, groupedByProduct);
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