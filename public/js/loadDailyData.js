// This script updates the content of the webpage.

// Data are obtained using APOD (Astronomy Picture of the Day) API from
// NASA.

// See:
// - https://api.nasa.gov/#signUp
// - https://github.com/nasa/apod-api
// - https://apod.nasa.gov/apod/astropix.html

(() => {
  const picture = document.querySelector(".picture");
  const text = document.getElementById("svgtext");
  const subtext = document.getElementById("svgsubtext");

  const todayDataLabels = ["date", "title", "explanation", "link", "copyright"];

  const todayData = todayDataLabels.map((label) => ({
    label,
    ref: document.querySelector(`.today-${label}`),
  }));

  const toadyVideoLink = document.querySelector(".today-videourl-link");

  function getApiUrl() {
    // fix API not working correctly in certain timezones / times
    // Sometimes, the data for today are not available
    // Then, load all the data from yesterday, and use the most recent available (today or yesterday data)
    // see https://github.com/nasa/apod-api/issues/48
    const date = new Date(); // today
    date.setDate(date.getDate() - 1); // yesterday
    const dateStr = date.toISOString().substring(0, 10);

    return `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&start_date=${dateStr}&thumbs=true`;
  }

  async function loadDailyData() {
    let responseStatus;

    fetch(getApiUrl(), { mode: "cors", cache: "force-cache" })
      .then((response) => {
        responseStatus = response.status;
        return response.json();
      })
      .then((jsonResponse) => {
        if (responseStatus == 200) {
          setData(jsonResponse[jsonResponse.length - 1]);
        } else {
          // Server error
          console.log(
            `${jsonResponse.error.code}: ${
              jsonResponse.error.msg || jsonResponse.error.message
            }`
          );

          const err = new Error(
            `${responseStatus} ${
              jsonResponse.error.code ? `(${jsonResponse.error.code})` : ""
            }`
          );
          err.status = responseStatus;
          throw err;
        }
      })
      .catch((error) => {
        setError(error);
      });
  }

  function setData(data) {
    const imageUrl =
      data.media_type == "image" ? data.hurl || data.url : data.thumbnail_url;
    const videoUrl = data.media_type == "video" ? data.url : null;

    picture.classList.add("image-of-the-day");
    picture.src = imageUrl;
    picture.alt = data.title;

    document.body.style.backgroundImage = `url(${imageUrl})`;

    if (toadyVideoLink && videoUrl) {
      toadyVideoLink.style.visibility = "visible";
      toadyVideoLink.href = videoUrl;
    }

    if (text) text.textContent = "";
    if (subtext) subtext.textContent = "";

    todayData.forEach(({ label, ref }) => {
      if (ref && data[label]) {
        if (label == "copyright") {
          ref.textContent = `Image Credit & Copyright: ${data[label]}`;
        } else {
          ref.textContent = data[label];
        }
      }
    });
  }

  function setError(err) {
    if (text) text.textContent = "HOUSTON, WE HAVE A PROBLEM";
    if (subtext) subtext.textContent = err;
    console.log(err);
  }

  loadDailyData();
})();
