// refresh action
localStorage.clear();
$("#chartContainer").css("display", "none");
let image = document.getElementsByClassName("thumbnail");
new simpleParallax(image, {
  orientation: "right",
});
getCoins();

let coinsArr = [];
function getCoins() {
  $.get("https://api.coingecko.com/api/v3/coins/list", (res) => {
    $(".loading").show();
    $("#overlay").show();
    coinsArr = Random100(res);
    drawCoins(coinsArr);
    $(".loading").hide();
    $("#overlay").hide();
  });
}

function drawCoins(array) {
  let i = 0;
  for (const coin of array) {
    let card = $(`
     <div class="col mb-4 accordion">
      <div class="card my-card bg-light">
       <div class="card-body">
        <div class="cardHeader">
          <h5 style="display:inline-block;"  class="card-title">${coin.symbol}</h5>
          <div class="switch">
          <label>
            <input id="toggle${i}" class="toggle" onclick="toggleEvent(event,'${coin.symbol}')" type="checkbox" value="true">
            <span class="lever"></span>
          </label>
         </div>
        </div>
          <p class="card-text">${coin.name}</p>
          <button aria-expanded="false" onclick="btnEvent(event,'${coin.id}')" class="btn my-btn" data-toggle="collapse" data-target="#content${i}">More Info</button>
          <div class="collapse card-body more-info-style" id="content${i}">
          </div>
          </div>
          </div>
          </div> 
          `);
    $(".card-deck").append(card);
    i++;
  }
  if (toggleID_arr[0] != null) {
    keepToggleChecked(toggleID_arr);
  }
}

function Random100(arr) {
  for (let i = 0; i != 100; i++) {
    let number = Math.floor(Math.random() * 5000);
    coinsArr.push(arr[number]);
  }
  return coinsArr;
}

function moreInfoDraw(coinId, containerid) {
  $(".loading-spinner").toggle("show");
  $.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, (res) => {
    const image = $(`
        <img src='${res.image.thumb}' alt="">
        `);
    const coin_data = $(`
        <ul>
        <li>USD:${res.market_data.current_price.usd}$</li>
        <li>EUR:${res.market_data.current_price.eur}€</li>
        <li>ILS:${res.market_data.current_price.ils}₪</li>
        </ul>
        `);
    $(`${containerid}`).append(coin_data);
    $(`${containerid}`).append(image);
    // create local storage object
    const obj = {
      image: res.image.thumb,
      USD: res.market_data.current_price.usd,
      EUR: res.market_data.current_price.eur,
      ILS: res.market_data.current_price.ils,
    };
    saveLocal(obj, coinId);
    $(".loading-spinner").toggle("show");
  });
}

function saveLocal(object, key) {
  localStorage.setItem(`'${key}'`, JSON.stringify(object));
  setTimeout(() => {
    localStorage.removeItem(`'${key}'`);
  }, 120000);
}

function drawFromLocal(key, target) {
  const obj = JSON.parse(localStorage.getItem(key));
  const image = $(`
    <img src='${obj.image}' alt="">
    `);
  const coin_data = $(`
    <ul>
    <li>USD:${obj.USD}$</li>
    <li>EUR:${obj.EUR}€</li>
    <li>ILS:${obj.ILS}₪</li>
    </ul>
    `);
  $(`${target}`).append(coin_data);
  $(`${target}`).append(image);
}

function btnEvent(e, id) {
  const toggle = e.target.getAttribute("aria-expanded");
  if (toggle == "false") {
    if (localStorage.getItem(`'${id}'`) == null) {
      moreInfoDraw(id, e.target.getAttribute("data-target"));
    } else {
      drawFromLocal(`'${id}'`, e.target.getAttribute("data-target"));
    }
  }
  if (toggle == "true") {
    $(e.target.getAttribute("data-target")).empty();
  }
}

let toggle_arr = [];
let toggleID_arr = [];
let last_click;
function toggleEvent(e, coin) {
  let toggle_value = e.target.value;
  let id = e.target.getAttribute("id");
  // add to arr
  if (toggle_value == "true") {
    toggle_arr.push(coin);
    toggleID_arr.push(id);
  }
  // remove from arr
  if (toggle_value == "false") {
    for (let i = 0; i < toggle_arr.length; i++) {
      let index = toggle_arr.indexOf(coin);
      if (toggle_arr[i] == coin) {
        toggle_arr.splice(index, 1);
        toggleID_arr.splice(index, 1);
      }
    }
  }
  // more the 5 popup
  if (toggle_value == "true" && toggle_arr.length == 6) {
    $(`#${id}`).prop("checked", false);
    toggle_value = "false";
    toggle_arr.pop();
    toggleID_arr.pop();
    last_click = e.target.getAttribute("id");
    more_then_five(toggle_arr, toggleID_arr);
  }
  // change toggle value
  if (toggle_value == "false") {
    e.target.value = "true";
  }
  if (toggle_value == "true") {
    e.target.value = "false";
  }
}

function more_then_five(coin_arr, id_arr) {
  $(".model").css("display", "block");
  $("#model-overlay").css("display", "block");
  $(".toggle").css("display", "flex");
  let x = 0;
  for (let i = 1; i < 6; i++) {
    $(`#span${i}`).text(`Coin Symbol: ${coin_arr[x]} `);
    $(`#btn${i}`).attr("value", `${id_arr[x]}`);
    x++;
  }
}

$("#close-btn").on("click", () => {
  $(".model").hide(1000);
  $("#model-overlay").css("display", "none");
});

$("#done-btn").on("click", () => {
  if (toggle_arr.length < 5) {
    $(".model").hide(1000);
    $("#model-overlay").css("display", "none");
    $(`#${last_click}`).trigger("click");
  }
});

let search_arr = [];
let sort_0arr = [];
$("#search").keyup(function () {
  search_arr = [];
  for (const coin of coinsArr) {
    if ($("#search").val() == coin.symbol) {
      search_arr.push(coin);
    }
  }
  if (search_arr[0] != null) {
    $(".card-deck").empty();
    drawCoins(search_arr);
    keepToggleCheckedSearch(toggle_arr, search_arr);
  } else {
    $(".card-deck").empty();
    drawCoins(coinsArr);
    keepToggleChecked(toggleID_arr);
  }
});

function removeEvent(e) {
  $(`#${e.target.value}`).trigger("click");
  e.target.parentElement.style.display = "none";
}

function keepToggleChecked(arr) {
  for (let i = 0; i < arr.length; i++) {
    $(`#${arr[i]}`).prop("checked", true);
    $(`#${arr[i]}`).val("false");
  }
}

function keepToggleCheckedSearch(arr, search_arr) {
  let obj = search_arr[0];
  for (const key of arr) {
    if (obj.symbol == key) {
      $("#toggle0").prop("checked", true);
      $("#toggle0").val("false");
    }
  }
}

$("#home").click(function () {
  drawCoins(coinsArr);
  $("#chartContainer").empty();
  $("#chartContainer").css("display", "none");
  $(".about").css("display", "none");
});

$("#about").click(function () {
  $(".card-deck").empty();
  $("#chartContainer").empty();
  $("#chartContainer").css("display", "none");
  $(".about").css("display", "flex");
});

//chart
let Val_arr = [];
$("#liveReports").click(async function () {
  $("#chartContainer").css("display", "block");
  $(".card-deck").empty();
  $(".about").css("display", "none");

  let chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Coins Value",
    },
    axisX: {
      valueFormatString: "HH:MM ",
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: "pointer",
      verticalAlign: "bottom",
      horizontalAlign: "left",
      dockInsidePlotArea: true,
    },
    data: [
      {
        type: "line",
        showInLegend: true,
        name: `${toggle_arr[0]}`,
        markerType: "square",
        xValueFormatString: "HH:MM",
        color: "#F08080",
        yValueFormatString: "#.#####$",
        dataPoints: [],
      },
      {
        type: "line",
        showInLegend: true,
        name: `${toggle_arr[1]}`,
        markerType: "square",
        color: "#93B793",
        xValueFormatString: "HH:MM",
        yValueFormatString: "#.#####$",
        dataPoints: [],
      },
      {
        type: "line",
        showInLegend: true,
        name: `${toggle_arr[2]}`,
        markerType: "square",
        color: "#4870A0",
        xValueFormatString: "HH:MM",
        yValueFormatString: "#.#####$",
        dataPoints: [],
      },
      {
        type: "line",
        showInLegend: true,
        name: `${toggle_arr[3]}`,
        markerType: "square",
        color: "#631464",
        xValueFormatString: "HH:MM",
        yValueFormatString: "#.#####$",
        dataPoints: [],
      },
      {
        type: "line",
        showInLegend: true,
        name: `${toggle_arr[4]}`,
        markerType: "square",
        color: "#EAD57F",
        xValueFormatString: "HH:MM",
        yValueFormatString: "#.#####$",
        dataPoints: [],
      },
    ],
  });
  chart.render();

  let PushObj_toData = function (arr, number) {
    if (arr == null) {
      return;
    }
    let obj = { x: new Date(), y: arr[number] };
    chart.data[number].dataPoints.push(obj);
  };

  async function UpdateChart(num, number) {
    SortData((Val_arr = await getCurrentVal()), number);
    PushObj_toData(Val_arr, num);
    chart.render();
  }

  let arr_length = await getApiArrLength().catch((err) =>
    alert("No data for those coins")
  );
  let interval;
  switch (arr_length) {
    case 1:
      UpdateChart(0, 0);
      interval = setInterval(() => {
        if ($("#chartContainer").css("display") == "none") {
          chart.data[0].dataPoints = [];
          clearInterval(interval);
        }
        UpdateChart(0, 0);
      }, 2000);
      break;
    case 2:
      UpdateChart(0, 0);
      UpdateChart(1, 1);
      interval = setInterval(() => {
        if ($("#chartContainer").css("display") == "none") {
          chart.data[0].dataPoints = [];
          clearInterval(interval);
        }
        UpdateChart(0, 0);
        UpdateChart(1, 1);
      }, 2000);
      break;

    case 3:
      UpdateChart(0, 0);
      UpdateChart(1, 1);
      UpdateChart(2, 2);
      interval = setInterval(() => {
        if ($("#chartContainer").css("display") == "none") {
          chart.data[0].dataPoints = [];
          clearInterval(interval);
        }
        UpdateChart(0, 0);
        UpdateChart(1, 1);
        UpdateChart(2, 2);
      }, 2000);
      break;
    case 4:
      UpdateChart(0, 0);
      UpdateChart(1, 1);
      UpdateChart(2, 2);
      UpdateChart(3, 3);
      interval = setInterval(() => {
        if ($("#chartContainer").css("display") == "none") {
          chart.data[0].dataPoints = [];
          clearInterval(interval);
        }
        UpdateChart(0, 0);
        UpdateChart(1, 1);
        UpdateChart(2, 2);
        UpdateChart(3, 3);
      }, 2000);
      break;
    case 5:
      UpdateChart(0, 0);
      UpdateChart(1, 1);
      UpdateChart(2, 2);
      UpdateChart(3, 3);
      UpdateChart(4, 4);
      interval = setInterval(() => {
        if ($("#chartContainer").css("display") == "none") {
          chart.data[0].dataPoints = [];
          clearInterval(interval);
        }
        UpdateChart(0, 0);
        UpdateChart(1, 1);
        UpdateChart(2, 2);
        UpdateChart(3, 3);
        UpdateChart(4, 4);
      }, 2000);
      break;
  }

  function SortData(arr, number) {
    if (arr == undefined) return;
    let result_arr;
    result_arr = arr[number];
    return result_arr;
  }
});

async function getCurrentVal() {
  Val_arr = [];
  return new Promise((resolve, reject) => {
    $.get(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${toggle_arr.join(
        ","
      )}&tsyms=USD&api_key={39be354bb1209025b3f0d64063c1a17c36a95f8147d3f8ae6bddb151eafe4f81}`,
      (res) => {
        if (res.Response == "Error") {
          reject();
        }
        for (const key in res) {
          Val_arr.push(res[key].USD);
        }
        resolve(Val_arr);
      }
    );
  });
}

function getApiArrLength() {
  Val_arr = [];
  return new Promise((resolve, reject) => {
    $.get(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${toggle_arr.join(
        ","
      )}&tsyms=USD&api_key={39be354bb1209025b3f0d64063c1a17c36a95f8147d3f8ae6bddb151eafe4f81}`,
      (res) => {
        if (res.Response == "Error") {
          reject();
        }
        for (const key in res) {
          Val_arr.push(res[key].USD);
        }
        resolve(Val_arr.length);
      }
    );
  });
}

//sticky nav bar
let num = 200;
$(window).bind("scroll", function () {
  if ($(window).scrollTop() > num) {
    $(".navbar").addClass("sticky");
    $(".navbar").css("left", "0");
  } else {
    $(".navbar").removeClass("sticky");
  }
});
//add padding when resize
$(window).resize(function () {
  if ($(window).width() < 1200) {
    $(".container > main").css("padding-top", "30px");
  }
  if ($(window).width() < 850) {
    $(".container > main").css("padding-top", "90px");
  }
});
