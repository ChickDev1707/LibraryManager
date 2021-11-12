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

function onLoad(data, label){
    var labels = label.toString().split(',')
    var datas = data.toString().split(',')
    var colors = getArrayRandomColor(datas).toString().split(',')
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Votes',
                data: datas,
                backgroundColor: colors,
                borderWidth: 1
            }]
        }, 
    });
}