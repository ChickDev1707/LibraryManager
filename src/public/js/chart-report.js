//random color
function randomColor(){
    let random = "#" + Math.floor(Math.random()*16777215).toString(16);
    return random
}

function getArrayRandomColor(data){
    let arrayColor = []
    data.forEach(element => {
        arrayColor.push(randomColor())
    });
    return arrayColor
}

//config color
const  borderColorConfig = [
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(153, 102, 255)',
    'rgb(201, 203, 207)'
]

const backgroundColorConfig = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(255, 205, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(201, 203, 207, 0.2)'
]

//load chart
function onLoad(data, label){
    var labels = label.toString().split(',')
    var datas = data.toString().split(',')
    var colors = getArrayRandomColor(datas).toString().split(',')
    const ctxPie = document.getElementById('myPieChart').getContext('2d');
    //pie chart
    const myPieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: datas,
                backgroundColor:backgroundColorConfig,
                borderColor: borderColorConfig,
                borderWidth: 1
            }]
        }, 
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
                borderColor: borderColorConfig,
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