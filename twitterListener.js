// https://github.com/twitterdev/Twitter-API-v2-sample-code/blob/main/Filtered-Stream/filtered_stream.js

const needle = require("needle");
const db = require("./mongodbInit");
const discordController = require("./discordBot");

const token = process.env.BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?expansions=author_id";

const rules = [
  {
    value: "from:ObeyMeOfficial -is:reply", // -is:nullcast -is:retweet
  },
  {
    value: "from:ObeyMeOfficial1 -is:reply -is:nullcast", // -is:retweet
  },
];

async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

/*
async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log(response.body);
    throw new Error(response.body);
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}
*/

function streamConnect(retryAttempt) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  stream
    .on("data", async (data) => {
      try {
        const json = JSON.parse(data);

        // TODO: Use Twitter rule matching instead of hard-coding.
        // Send discord messages.
        const tweetId = json.data.id;
        const username = json.includes.users.find(
          (x) => x.id == json.data.author_id
        ).username;
        const lang = username == "ObeyMeOfficial1" ? "en" : "ja";
        // discordController.sendTwitterUpdates(
        //   lang,
        //   `https://twitter.com/${username}/status/${tweetId}`
        // );
        discordController.sendMessage(
          "1022190209179328655",
          `https://twitter.com/${username}/status/${tweetId}`
        );

        // A successful connection resets retry count.
        retryAttempt = 0;
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          discordController.sendMessage("1022190209179328655", data.detail);

          // process.exit(1);
          return;
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        discordController.sendMessage("1022190209179328655", error.code);

        // process.exit(1);
        return;
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
}

(async () => {
  let currentRules;

  try {
    // Gets the complete list of rules currently applied to the stream
    currentRules = await getAllRules();

    // Delete all rules. Comment the line below if you want to keep your existing rules.
    // await deleteAllRules(currentRules);

    // Add rules to the stream. Comment the line below if you don't want to add new rules.
    // await setRules();
  } catch (e) {
    console.error(e);
    // process.exit(1);

    discordController.sendMessage("1022190209179328655", e.message);
    return;
  }

  // Listen to the stream.
  streamConnect(0);
})();
