require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MongoClient } = require("mongodb");
const cron = require('node-cron')
const sub = require('./models/sub')
const subs = require('./models/sub')

console.log(process.env.IQAIR_KEY)

//connection setup
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true
}, (err)=>{
    if(err)
    {console.log(err)
    }else{
        console.log("succes")
    }
})

//allow the server to use json
app.use(express.json())

//link to other routes
const subsRouter =require('./routes/subs')
app.use('/subs', subsRouter)

//get the pollution data from two parameters longitude and latitude
app.get('/pollution-data/:x/:y',async (req, res) => {

        //fetch the data from the api using the two parameters
        fetch(`http://api.airvisual.com/v2/nearest_city?lat=${req.params.x}&lon=${req.params.y}&key=${process.env.IQAIR_KEY}`)
        //convert to json than parse through to get only the pollution data of that zone
        .then(ress => ress.json())
        .then((data)=>{
            const obj = JSON.parse(JSON.stringify(data))
            const result = obj.data.current.pollution
            //send the results 
            res.send(result)
        })
  })
// build the cron job
  async function getAPI(x,y){
      // fetch the data from the api than parse it and putting in result
    const apiStream = await fetch(`http://api.airvisual.com/v2/nearest_city?lat=${x}&lon=${y}&key=${process.env.IQAIR_KEY}`)
                            .then((apiStream) => apiStream.json())
    const obj = JSON.parse(JSON.stringify(apiStream))
    const result = obj.data.current.pollution.aqius
    //cron schedule for every minute
    cron.schedule('* * * * *', () => {
        //create new data from subs schema and passing it the quality of air, the date gets passed automaticly
        const d = new subs({
            quality:result, 
        })
        //saving it to database
        d.save()
        console.log(d)
    })  
}
//calling the function to lunch the cron job
getAPI(48.856, 2.352)


//endpoint to get the datetime where paris zone is most polluted
app.get('/most-polluted', (req, res) => {
    // to get the collection where the data is collected
    const client = new MongoClient(process.env.DATABASE_URL);
    const db = client.db("new");
    const coll = db.collection("subs");

    //creating an empty array 
    let arr = []
    //query the collection by date and quality 
    coll.find({}).project({ quality: 1,date:1,_id: 0})
    //iterating throug each element from the query results
    .forEach(element => arr.push(element))
    //creating the function to get the date of the highest pollution point
    .then(() => {
        let worst = 0
        let ress
        //looping through to find the max and retreiving the index
        for(i=0;i<arr.length;i++){
            if (arr[i].quality > worst){
                worst= arr[i].quality 
                console.log(i + "   " + worst)
                ress = i
            }
        }
        //sending the date
        res.send(arr[ress].date)
    })
    .catch(() => {console.log("error")})
})




app.listen(3000, () => console.log('Server started'))