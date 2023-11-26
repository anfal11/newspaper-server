const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
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

//user related api
app.get('/users', async (req, res)=>{
    const users = await userCollection.find().toArray();
    res.send(users);
})
    
app.post('/users', async (req, res)=>{
    const newUser = req.body;
    const result = await userCollection.insertOne(newUser);
    console.log('user added', result);
    res.send(result);
})
// app.post('/', async (req, res)=>{
//     const {title, description, url, urlToImage, publishedAt, content} = req.body;
//     try {
//         const newArticle = new Article({
//         title, description, url, urlToImage, publishedAt, content
//         })
//         const savedArticle = await newArticle.save();
//         res.json(savedArticle);
//     } catch (error) {
//         console.log(error);
//     }
// })
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