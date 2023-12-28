const crypto = require("crypto-js");
function buildImageUploadApiPayload(imageBin) {
  const payload = {
    invokedSkills: ["ImageById"],
    subscriptionId: "Bing.Chat.Multimodal",
    invokedSkillsRequestData: {
      enableFaceBlur: true,
    },
    convoData: {
      convoid: "",
      convotone: "Balanced",
    },
  };

  const knowledgeRequest = {
    imageInfo: {},
    knowledgeRequest: payload,
  };

  const boundary =
    "----WebKitFormBoundary" +
    Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join("");

  const data =
    `--${boundary}\r\nContent-Disposition: form-data; name="knowledgeRequest"\r\n\r\n` +
    `${JSON.stringify(
      knowledgeRequest
    )}\r\n--${boundary}\r\nContent-Disposition: form-data; name="imageBase64"\r\n\r\n` +
    `${imageBin}\r\n--${boundary}--\r\n`;

  return { data, boundary };
}

// upload image
async function uploadImageToBlob(data, boundary) {
  // Set headers
  let reqHeaders = {}; /*{ ...header };*/
  reqHeaders["content-type"] = `multipart/form-data; boundary=${boundary}`;
  reqHeaders["referer"] =
    "https://www.bing.com/search?q=Bing+AI&showconv=1&FORM=hpcodx";
  reqHeaders["origin"] = "https://www.bing.com";

  try {
    const res = await fetch("https://www.bing.com/images/kblob", {
      method: "POST",
      headers: reqHeaders,
      body: data,
    });

    let imageRes = await res.json();

    if (imageRes["processedBlobId"] !== "") {
      imageRes["imageUrl"] =
        "https://www.bing.com/images/blob?bcid=" + imageRes["processedBlobId"];
    } else if (imageRes["blobId"] !== "") {
      imageRes["imageUrl"] =
        "https://www.bing.com/images/blob?bcid=" + imageRes["blobId"];
    }

    imageRes["originalImageUrl"] =
      "https://www.bing.com/images/blob?bcid=" + imageRes["blobId"];

    return imageRes;
  } catch (error) {
    throw error;
  }
}

// generate random hex
function generateRandomHexString(length) {
  return crypto.randomBytes(length).toString("hex");
}

function targetPromptHandler(target) {
  switch (target) {
    case "HTMLCSS":
      return "You are an expert html developer. A user will provide you with a low-fidelity wireframe of an application and you will return a single html file that uses pure css to create the website. Use creative license to make the application more fleshed out. if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the html file.";
      break;
    case "HTMLTAILWIND":
      return "You are an expert tailwind developer. A user will provide you with a low-fidelity wireframe of an application and you will return a single html file that uses tailwind to create the website. Use creative license to make the application more fleshed out. if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the html file.";
      break;
    case "RNJS":
      return "You are an expert react native developer. A user will provide you with a low-fidelity wireframe of an application and you will return a single react native file that uses javascript to create the application. Use creative license to make the application more fleshed out. if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the javascript file.";
      break;
    case "RNTS":
      return "You are an expert react native developer. A user will provide you with a low-fidelity wireframe of an application and you will return a single react native file that uses typescript to create the application. Use creative license to make the application more fleshed out. if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the typescript file.";
      break;
    case "FLUTTER":
      return "You are an expert flutter developer. A user will provide you with a low-fidelity wireframe of an application and you will return a single flutter file that uses dart to create the application. Use creative license to make the application more fleshed out. if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the dart file.";
      break;
    default:
      break;
  }
}

function decrypt(text) {
  const secretPass = "XkhZG4fW2t2W";
  const bytes = crypto.AES.decrypt(text, secretPass);
  const data = bytes.toString(crypto.enc.Utf8);

  return data;
}

module.exports = {
  buildImageUploadApiPayload,
  generateRandomHexString,
  uploadImageToBlob,
  targetPromptHandler,
  decrypt,
};
