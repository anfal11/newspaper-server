const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ey8cr7h.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("newspaper").collection("users");
    const articlesCollection = client.db("newspaper").collection("articles");

//user related api
app.get('/users', async (req, res)=>{
    const users = await userCollection.find().toArray();
    res.send(users);
})
app.get('/users/:id', async (req, res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
    const users = await userCollection.findOne(query);
    res.send(users);
})

app.post('/users', async (req, res)=>{
    const query = {email: req.body.email};
    console.log(55, req.body.email);
    const existingUser = await userCollection.findOne(query);
     if(existingUser){
         console.log(58, existingUser);
          res.send({message: 'user already exists', insertedId: null});
     } else {
         const newUser = req.body;
         const result = await userCollection.insertOne(newUser);
         res.send(result);
     }
 })

 app.put('/users', async (req, res)=>{
    const query = {email: req.body.email};
    const existingUser = await userCollection.findOne(query);
     if(!existingUser){
          res.send({message: 'user does not exists', insertedId: null});
     } else {
         const result = await userCollection.updateOne(query, 
          {
            $set: req.body
          }
          );
         res.send(result);
     }
 })

// app.get('/users/admin/:email', async(req, res) => {
//     console.log(83, req.params, req?.decoded?.email);
//     const email = req?.params?.email;
//     if (email !== req?.user?.email) {
//       return res.status(403).send({message: 'Unauthorized request'})
//     }
//     const query = {email: email};
//     const user = await userCollection.findOne(query);
//     let admin = false;
//     if(user){
//       admin = user?.role === 'admin';
//     }
//     res.send({admin});
//   })
    

    //article related api
    // app.get('/articles', async(req, res)=> {
    //     const articles = await articlesCollection.find().toArray();
    //     res.send(articles);
    // })

// article related api
    app.get('/articles', async (req, res) => {
      const filter = req.query;
      // console.log(filter);
      const query = {};
      if (filter.search) {
        query.title =  { $regex: filter.search , $options: 'i' }
      }
   
      // Handle sorting logic
      const options = {
        sort: {
          viewCount: filter.sort === 'asc' ? 1 : -1,
        },
        // projection: sort === 'desc' ? { _id: 0, title: 1, viewCount: 1 } : {},
      };
    
      const articles = await articlesCollection.find(query, options).toArray();
      res.send(articles);
    });
    
    


  app.get('/articles/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    try {
        const article = await articlesCollection.findOne(query);
        if (!article) {
            return res.status(404).send({ message: 'Article not found' });
        }
        await articlesCollection.updateOne(query, { $inc: { viewCount: 1 } });
        res.send(article);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Add an article update API endpoint

// ...
app.put('/articles/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const update = req.body;

  try {
    const result = await articlesCollection.updateOne(query, { $set: update });
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});


app.delete('/articles/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const result = await articlesCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});




app.post('/articles', async (req, res) => {
    const article = req.body;
    const result = await articlesCollection.insertOne(article);
    res.send(result);
})

// Add an API endpoint to fetch decline reason

app.get('/articles/:id/declineReason', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const article = await articlesCollection.findOne(query);
    res.send({ declineReason: article?.declineReason });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Newspaper is running.......')
})

app.listen(port, () => {
  console.log(`Newspaper is running on port ${port}`)
})