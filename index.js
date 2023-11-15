const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()

app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

app.use(cookieParser())

const logger = (req, res, next) => {
  console.log("Log Info call", req.method, req.url);
  next()
}

const varifitoken = (req, res, next) =>{
  const token = req?.cookies?.token;
  console.log('varified token in the middleware',token);
if (!token) {
  return res.status(401).send({message: 'unautorized Acess'})
}

jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
  if (err) {
    return res.status(401).send({message: 'unautorized Acess'})
  }

  req.user = decoded
   next()
})


}




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
    const bookingRoomColection = room.collection('bookingRoom')
    const reviewCollection = room.collection('customerReview')


   // Auth Related Api

   app.post('/jwt', async(req, res) =>{
    const user = req.body;
    console.log('user token user for', user);
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    .send({success: true})

   })


   app.post('/logout', async(req, res) =>{
    const user = req.body
    console.log('user log out', user);
    res.clearCookie('token', {maxAge: 0}).send({success: true})
   })




// Client site related Api
    app.get('/rooms', async(req, res) =>{
        const cursor =  roomColection .find();
        const result = await cursor.toArray();
        res.send(result)
     });


    
    
   app.get('/rooms/:id', async(req, res) =>{
    const id = req.params.id;
    const query= {_id: new ObjectId(id)}
    const result = await roomColection.findOne(query)
    res.send(result)
   })

   app.get('/booking', logger, varifitoken, async(req, res) =>{
   console.log("token owner info", req.user);
   
   if (req.user.email !== req.params.email) {
    return res.status(403).send({message: "forbidden Access"})
  }
    const cursor =  bookingRoomColection.find();
    const result = await cursor.toArray();
    res.send(result)
 });

 app.get('/update', async(req, res) =>{
  const cursor =  bookingRoomColection.find();
  const result = await cursor.toArray();
  res.send(result)
});

app.get('/update/:id', async(req, res) =>{
  const id = req.params.id;
  const query= {_id: new ObjectId(id)}
  const result = await bookingRoomColection.findOne(query)
  res.send(result)
 })



//  app.get('/booking/:id', async(req, res) =>{

//   const id = req.params.id;
//   const query = {_id: new ObjectId(id)}
//   const result = await bookingRoomColection.findOne(query);
//   res.send(result)
// }),


app.get('/booking/:email', logger, varifitoken, async(req, res) =>{
  
  const bookingEmail = req.params.email;



   if (req.user.email !== req.params.email) {
    return res.status(403).send({message: "forbidden Access"})
  }
  const query = {email: bookingEmail}
  console.log("token owner info", req.user);
 
  const result = await bookingRoomColection.find(query).toArray();
  res.send(result)
})




app.get('/review', async(req, res) =>{
  const cursor =  bookingRoomColection.find();
  const result = await cursor.toArray();
  res.send(result)
});




app.get('/review/:id', async(req, res) =>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await bookingRoomColection.find(query).toArray()
  res.send(result)
})



app.get('/review-customer', async(req, res) =>{
  const cursor =  reviewCollection.find();
  const result = await cursor.toArray();
  res.send(result)
});



//  app.get('/booking' , async(req, res) =>{
//   console.log(req.query);
//   let query = {}
//   if (req.query?.email) {
//     query = {email: req.query.email}
//   }

//   console.log( query);
//   const cursor = bookingRoomColection.find(query);
//   const result = await cursor.toArray();
//   res.send(result)
// })


// for main room update


// app.put('/room/update/:id', async(req, res) =>{
//   const id = req.params.id
//   const room = req.body;
//   console.log(id, room);

//   const filter = {_id: new ObjectId(id)}
//   const options = {upsert: true};
//   const updateRoom = {
//     $set: {
//       bookDate: room.bookDate,
//       chekOutDate: room.chekOutDate,
//       dayCount: room.dayCount,
//       email: room.email
//     }
//   }

//   const result = await roomColection .updateOne(filter, updateRoom, options)
//   res.send(result)
// })

   app.post('/booking', async(req, res) =>{
    const book = req.body;
    console.log(book);
    const result = await bookingRoomColection.insertOne(book)
    res.send(result)
   })

   

  //  app.post('/booking', async (req, res) => {
  //   const booking = await bookingRoomColection.findOne({ _id: room.id });
  //   console.log(booking);
  //   const {bookDate, chekOutDate, dayCount, email} = booking;
  //   const roomUpdateResult = await roomColection.updateOne(
  //     { _id: new ObjectId(bookingId) },
  //     {
  //       $set: {
  //         bookDate,
  //         chekOutDate,
  //         dayCount,
  //         email,
  //       },
  //     },
  //     { upsert: true } 
  //   )

  //   res.send(roomUpdateResult)

  //  })

   app.post('/review-customer', async(req, res) =>{
    const review = req.body;
    const result = await reviewCollection.insertOne(review)
    res.send(result)
   })


   app.delete('/booking/:id', async(req, res) =>{
    const id = req.params.id;
    const query ={_id : new ObjectId(id)}
    const result = await bookingRoomColection.deleteOne(query)
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
