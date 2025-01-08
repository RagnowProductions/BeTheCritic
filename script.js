document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const promptInput = document.getElementById("prompt");
  const attributeInput = document.getElementById("attribute");
  const attributesList = document.getElementById("attributes-list");
  const generateBtn = document.getElementById("generateBtn");
  const saveDataBtn = document.getElementById("saveDataBtn");
  const status = document.getElementById("status");
  const generatedImage = document.getElementById("generatedImage");
  const rating = document.getElementById("rating");
  const likeBtn = document.getElementById("likeBtn");
  const dislikeBtn = document.getElementById("dislikeBtn");
  const modelGallery = document.getElementById("modelGallery");

  let attributes = [];
  let trainingData = [];

  document.getElementById("add-attribute").addEventListener("click", () => {
    const attribute = attributeInput.value.trim();
    if (attribute) {
      attributes.push(attribute);
      const listItem = document.createElement("li");
      listItem.textContent = attribute;
      attributesList.appendChild(listItem);
      attributeInput.value = "";
    }
  });

  generateBtn.addEventListener("click", () => generateImage());

  likeBtn.addEventListener("click", () => {
    saveFeedback("like");
    generateImage();
  });

  dislikeBtn.addEventListener("click", () => {
    saveFeedback("dislike");
    generateImage();
  });

  saveDataBtn.addEventListener("click", () => saveTrainingData());

  async function generateImage() {
    const apiKey = apiKeyInput.value.trim();
    const prompt = promptInput.value.trim();
    if (!apiKey || !prompt) {
      alert("Please enter your API key and prompt.");
      return;
    }

    const fullPrompt = `${prompt}, ${attributes.join(", ")}`;
    status.textContent = "Generating image...";
    generatedImage.style.display = "none";
    rating.style.display = "none";

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt: fullPrompt, n: 1, size: "512x512" })
      });

      if (!response.ok) {
        throw new Error("Failed to generate image.");
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      generatedImage.src = imageUrl;
      generatedImage.style.display = "block";
      rating.style.display = "block";
      status.textContent = "Here is your generated image:";

      addModelToGallery(imageUrl, fullPrompt);
    } catch (error) {
      console.error(error);
      status.textContent = "Error generating image. Please try again.";
    }
  }

  function saveFeedback(feedback) {
    const prompt = promptInput.value.trim();
    const fullPrompt = `${prompt}, ${attributes.join(", ")}`;
    trainingData.push({ prompt: fullPrompt, feedback });
  }

  function addModelToGallery(imageUrl, prompt) {
    const modelDiv = document.createElement("div");
    modelDiv.classList.add("model");

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = prompt;
    modelDiv.appendChild(img);

    modelGallery.appendChild(modelDiv);
  }

  async function saveTrainingData() {
    const zip = new JSZip();
    const jsonData = JSON.stringify(trainingData, null, 2);
    zip.file("training_data.json", jsonData);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "training_data.zip";
    link.click();
  }
});
