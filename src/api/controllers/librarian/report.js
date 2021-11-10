async function getDayReportPage(req, res){
    try{
        res.render('librarian/report/day-report.ejs')
    }catch{
        res.redirect('/librarian')
        console.log(error) 
    }
}

async function getMonthReportPage(req, res){
    try{
        res.render('librarian/report/month-report.ejs')
    }catch{
        res.redirect('/librarian')
        console.log(error) 
    }
}

module.exports={
    getDayReportPage,
    getMonthReportPage
}