const BorrowReturnCard = require('../../models/borrow-return-card')
const BookCategory = require('../../models/book-category')
const BookHead = require('../../models/book-head')
const Reader = require('../../models/reader')

//get month report array
async function getMonthReportArray(month){
    const reportArray = new Array()
    if(month != '' && month != undefined){
        const bookCategorys = await BookCategory.find()
        for await(const bookCategory of bookCategorys){
            let reportCategory = {
                bookCategory: bookCategory,
                count: 0
            } 
            const bookHeads = await BookHead.find({the_loai: bookCategory._id})
            for await(const bookHead of bookHeads){
                const countBorrowReturnCard = await BorrowReturnCard.find({
                    dau_sach: bookHead._id,
                    ngay_muon:{
                        $gte: month + "-01T00:00:00.000Z",
                        $lt: month + "-31T23:59:59.000Z"
                    } 
                }).countDocuments().exec()
                await (reportCategory.count += countBorrowReturnCard)
            }
            await reportArray.push(reportCategory)
        } 
    }
    return reportArray
}

async function getChartValue(reportArray){
    let label = new Array()
    let data = new Array()
    let  sum = 0

    reportArray.forEach(report=>{
        sum += report.count
        label.push(report.bookCategory.ten_the_loai)
        data.push(report.count)
    })

    return {label, data, sum}
}

//get day report array
async function getDayReportArray(date){
    const borrowReturnCards = await BorrowReturnCard.find({
        tinh_trang: 2,
        ngay_tra: {
            $gte: date + "T00:00:00.000Z",
            $lt: date + "T23:59:59.000Z"
        }
    })
    .populate('doc_gia')
    .populate('dau_sach')
    .sort({so_ngay_tra_tre: -1})
    .exec()
    return borrowReturnCards
}
module.exports={
    getMonthReportArray,
    getChartValue,
    getDayReportArray
}