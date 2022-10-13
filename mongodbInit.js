const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const db = client.db("obeyme_bot");
const servers = client.db("obeyme_bot").collection("servers");
const summons = client.db("obeyme_bot").collection("summonResults");
const cards = client.db("obey_me").collection("cards");
const events = client.db("obey_me").collection("events");

// Cards

exports.getNightmares = async function (name) {
  let nightmares = await db
    .collection("nightmares")
    .find()
    .sort({ name: 1 })
    .toArray();
  return nightmares;
};

exports.findNightmare = async function (name) {
  // find from short names
  let regex = "^" + name + "$";
  let nightmare = await db.collection("nightmares").findOne({
    $or: [
      { short: { $regex: regex, $options: "i" } },
      { name: { $regex: regex, $options: "i" } },
    ],
  });
  return nightmare;
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

// Servers

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

exports.saveResults = async function (uid, results) {
  try {
    let docs = [];
    results.forEach((x) => {
      docs.push({ user: uid, name: x.name, date: new Date() });
    });

    await summons.insertMany(docs);
    // await limitSummonResults(uid);

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

async function limitSummonResults(uid) {
  try {
    let total = await summons.countDocuments({ user: uid });
    if (total > 100) {
      let extraCount = total - 100;
      let allSummons = await summons
        .find({ user: uid })
        .sort({ date: 1 })
        .limit(extraCount);
      allSummons.forEach(async (x) => {
        await summons.deleteOne({ _id: x._id });
      });
    }
    return;
  } catch (e) {
    console.error(e);
    return;
  }
}
