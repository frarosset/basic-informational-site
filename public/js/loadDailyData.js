// This script updates the content of the webpage.

// Data are obtained using APOD (Astronomy Picture of the Day) API from
// NASA.

// See:
// - https://api.nasa.gov/#signUp
// - https://github.com/nasa/apod-api
// - https://apod.nasa.gov/apod/astropix.html

(() => {
  const picture = document.querySelector(".picture");

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

    fetch(getApiUrl(), { mode: "cors" })
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
    console.log(data);

    const imageUrl =
      data.media_type == "image" ? data.hurl || data.url : data.thumbnail_url;

    picture.src = imageUrl;
    picture.alt = data.title;

    document.body.style.backgroundImage = `url(${imageUrl})`;
  }

  function setError(err) {
    picture.alt = err;
  }

  loadDailyData();
})();
