const BorrowReturnCard = require('../../models/borrow-return-card')
const BookCategory = require('../../models/book-category')
const BookHead = require('../../models/book-head')
const Reader = require('../../models/reader')

const reportService = require('../../services/librarian/report')

//get month report pages
async function getMonthReportPage(req, res){
    if(!req.query.month){
        let today = new Date()
        let thisMonth = "2022-01"
        if (today.getMonth > 8){
            thisMonth = today.getFullYear() + '-' + (today.getMonth()+1)
        }else{
            thisMonth = today.getFullYear() + '-0' + (today.getMonth()+1)
        }
        req.query.month = thisMonth
    }

    try{
        const reportArray = await reportService.getMonthReportArray(req.query.month)
        await reportArray.sort((a, b)=>{
            return b.count -a.count
        })
        const {label, data, sum, ratio} = await reportService.getChartValue(reportArray)

        res.render('librarian/report/month-report.ejs',{
            month: req.query.month,
            reportArray: reportArray,
            label: label,
            data: data,
            sum: sum,
            ratio: ratio
        })
    }catch{
        res.redirect('/')
        console.log(error) 
    }
}

//get day report page
async function getDayReportPage(req, res){
    if(!req.query.date){
        let today = new Date()
        today = today.toISOString().split('T')[0]
        req.query.date = today
        console.log(today)
    }
    try{  
        const borrowReturnCards = await reportService.getDayReportArray(req.query.date)
        res.render('librarian/report/day-report.ejs',{
            borrowReturnCards: borrowReturnCards,
            date: req.query.date
        })
    }catch{
        res.redirect('/')
        console.log(error) 
    }
}

module.exports={
    getDayReportPage,
    getMonthReportPage
}