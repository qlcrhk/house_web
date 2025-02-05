require('dotenv').config(); // dotenv 설정

const { MongoClient, ServerApiVersion } = require('mongodb');

// .env 파일에서 MONGODB_URI 가져오기
const uri = process.env.MONGODB_URI;

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
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB 연결에 성공했습니다!");
  } catch (error) {
    console.error("MongoDB 연결 오류:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
