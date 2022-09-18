const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const servers = client.db("obeyme_bot").collection("servers");
const cards = client.db("obey_me").collection("cards");

// async function run() {
//   try {
//     const query = { rarity: "UR" };
//     const card = await cards.findOne(query);

//     // console.log(card);
//   } catch (e) {
//     console.error(e);
//   }
// }

// run().catch(console.dir);

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

exports.addServer = async function (guild) {
  try {
    console.log(guild);
    return await servers.insertOne({
      _id: guild.id,
      info: guild,
      settings: {
        newsChannels: {
          en: {
            channelId: "",
            message: "",
          },
          ja: {
            channelId: "",
            message: "",
          },
        },
        discovery: false,
      },
    });
  } catch (e) {
    console.error(e);
    return e;
  }
};

exports.updateServerInfo = async function (query, newData) {
  try {
    return await servers.findOneAndUpdate(query, newData);
  } catch (e) {
    console.error(e);
    return e;
  }
};

exports.deleteServer = async function (serverId) {
  try {
    return await servers.deleteOne({ _id: serverId });
  } catch (e) {
    console.error(e);
    return e;
  }
};
