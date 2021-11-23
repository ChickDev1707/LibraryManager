const BorrowReturnCard = require('../../models/borrow-return-card')
const BookCategory = require('../../models/book-category')
const BookHead = require('../../models/book-head')
const Reader = require('../../models/reader')

const reportService = require('../../services/librarian/report')
//get month report pages
async function getMonthReportPage(req, res){
    if(!req.query.month){
        let today = new Date()
        let thisMonth = today.getFullYear() + '-' + (today.getMonth()+1)
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
        res.redirect('back')
        console.log(error) 
    }
}


async function getDayReportPage(req, res){
    if(!req.query.date){
        let today = new Date()
        let thisDate = today.getFullYear() + "-" + (today.getMonth()+1) + "-" +today.getDate()
        req.query.date = thisDate
    }
    try{   
        const borrowReturnCards = await reportService.getDayReportArray(req.query.date)
        res.render('librarian/report/day-report.ejs',{
            borrowReturnCards: borrowReturnCards,
            date: req.query.date
        })
    }catch{
        res.redirect('back')
        console.log(error) 
    }
}

module.exports={
    getDayReportPage,
    getMonthReportPage
}