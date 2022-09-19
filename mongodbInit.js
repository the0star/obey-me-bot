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
//   } catch (e) {
//     console.error(e);
//   }
// }

// run().catch(console.dir);

// Cards

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

// Servers

exports.updateServerInfo = async function (serverId, newData) {
  try {
    return await servers.findOneAndUpdate({ _id: serverId }, { $set: newData });
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

exports.getServerInfo = async function (serverId, returnVal) {
  try {
    return await servers.findOne({ _id: serverId }, returnVal);
  } catch (e) {
    console.error(e);
    return e;
  }
};

exports.getNewsChannels = async function (lang) {
  try {
    let match = {};
    match["settings.newsChannels." + lang + ".channelId"] = {
      $ne: "",
    };
    const agg = [
      {
        $match: match,
      },
      {
        $project: {
          channelId: "$settings.newsChannels." + lang + ".channelId",
          message: "$settings.newsChannels." + lang + ".message",
        },
      },
    ];
    const cursor = servers.aggregate(agg);
    const result = await cursor.toArray();
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};
