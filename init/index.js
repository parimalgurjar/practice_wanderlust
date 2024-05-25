const mongoose=require("mongoose")
const initData=require("./data")
const Listing=require("../models/listing.js")
const MONGO_URL='mongodb://127.0.0.1:27017/practiceWanderlust'

async function main(){
    await mongoose.connect(MONGO_URL)
}
main().then(()=>{
    console.log("conneted to db")

}).catch((err)=>{
    console.log(err)
})

const initDB=async()=>{
    await Listing.deleteMany({})
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:"664caa498d2b9bdeeacf9f3a"
    }))
    await Listing.insertMany(initData.data)
    console.log("data was initilize")
}
initDB()