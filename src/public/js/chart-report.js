//config color
const backgroundColorConfig = [
    'rgba(255, 0, 0, 0.5)',
    'rgba(255, 128, 0, 0.5)',
    'rgba(255, 255, 0, 0.5)',
    'rgba(0, 255, 0, 0.5)',
    'rgba(0, 255, 255, 0.5)',
    'rgba(0, 0, 255, 0.5)',
    'rgba(255, 0, 255, 0.5)',
    'rgba(255, 0, 127, 0.5)',
    'rgba(128, 128, 128, 0.5)'

]

//load chart
function onLoad(data, label, ratio){
    var labels = label.toString().split(',')
    var datas = data.toString().split(',')
    var ratios = ratio.toString().split(',')

    const ctxPie = document.getElementById('myPieChart').getContext('2d');
    //pie chart
    const myPieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: ratios,
                backgroundColor:backgroundColorConfig,
                borderWidth: 1
            }]
        }
    });

    //bar chart
    const ctxBar = document.getElementById('myBarChart').getContext('2d');
    const myBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lượt mượn',
                data: datas,
                backgroundColor: backgroundColorConfig,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}