const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const servers = client.db("obeyme_bot").collection("servers");
const cards = client.db("obey_me").collection("cards");

async function run() {
  try {
    const query = { rarity: "UR" };
    const card = await cards.findOne(query);

    // console.log(card);
  } catch (e) {
    console.error(e);
  }
}

run().catch(console.dir);

exports.getNewsChannels = async function (lang = "en") {
  try {
    let servers = servers.find({ en_news: 0 });
    console.log(servers);
  } catch (e) {
    console.error(e);
  }
};

exports.getRandomCard = async function (source, rarity) {
  try {
    return await cards
      .aggregate([
        {
          $match: {
            source: { $in: [source] },
            rarity: { $in: rarity },
          },
        },
        { $sample: { size: 1 } },
      ])
      .toArray();
  } catch (e) {
    console.error("Error:", e);
  }
};
