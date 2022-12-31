require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MongoClient } = require("mongodb");
const cron = require('node-cron')
const sub = require('./models/sub')
const subs = require('./models/sub')

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/new", {
   useNewUrlParser: true,
   useUnifiedTopology: true
}, (err)=>{
    if(err)
    {console.log(err)
    }else{
        console.log("succes")
    }
})


app.use(express.json())

const subsRouter =require('./routes/subs')
app.use('/subs', subsRouter)

/*
fetch('http://api.airvisual.com/v2/countries?key=b9987695-8e20-497f-a2b1-e3f568ee53c0')
.then(res => res.json())
.then(data => console.log(data))
*/
app.get('/', async (req, res) => {


    
  })


  async function getAPI(x,y){
    const apiStream = await fetch(`http://api.airvisual.com/v2/nearest_city?lat=${x}&lon=${y}&key=b9987695-8e20-497f-a2b1-e3f568ee53c0`)
                            .then((apiStream) => apiStream.json())
    const obj = JSON.parse(JSON.stringify(apiStream))
    const result = obj.data.current.pollution.aqius
    cron.schedule('* * * * *', () => {
        const d = new subs({
            quality:result, 
        })
        d.save()
        console.log(d)
    })  
}
getAPI(48.856, 2.352)


app.get('/aa', (req, res) => {
const client = new MongoClient("mongodb://127.0.0.1:27017/new");
const db = client.db("new");
const coll = db.collection("subs");

let arr = []
let a 
coll.find({}).project({ quality: 1,date:1,_id: 0})
.forEach(element => arr.push(element))
.then(() => {
    let worst = 0
    let ress
    for(i=0;i<arr.length;i++){
        if (arr[i].quality > worst){
            worst= arr[i].quality 
            console.log(i + "   " + worst)
            ress = i
        }
    }
    res.send(arr[ress].date)
})
//.catch(() => {console.log("error")})

     console.log(a)


})


//cursor.forEach(element => arr.push(element));

//let a = cursor.toArray();


 










app.listen(3000, () => console.log('Server started'))