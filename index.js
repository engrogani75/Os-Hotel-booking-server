const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()

app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d33r4qq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();

    const room = client.db("hoteBooking");
    const roomColection = room.collection('roomDeatis')


    app.get('/rooms', async(req, res) =>{
        const cursor =  roomColection .find();
        const result = await cursor.toArray();
        res.send(result)
     });

    //  app.get('/rooms/:id', async(req, res) =>{
    //     const id = req.params.id
    //     const query = {_id: new ObjectId(id)}
    //     const result = await roomColection.findOne(query)
    //     res.send(result)
    //    })
    
   app.get('/rooms/:id', async(req, res) =>{
    const id = req.params.id;
    const query= {_id: new ObjectId(id)}
    const result = await roomColection.findOne(query)
    res.send(result)
   })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Hotel is booking')
})

app.listen(port, () => {
    console.log(`hotel is booking ${port}`);
})
