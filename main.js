import { FetchWrapper } from "./fetch-wrapper.js";
import snackbar from "snackbar";
import "snackbar/dist/snackbar.min.css";
import Chart from "chart.js/auto";

const form = document.querySelector("form");
const inputCarbs = document.querySelector("#carbs");
const inputProtein = document.querySelector("#protein");
const inputFat = document.querySelector("#fat");
const submitButton = document.querySelector("button");
const selectFoodType = document.querySelector("select");
const foodItemsContainer = document.querySelector(".foodItems__container");
const totalCalories = document.querySelector(".caloriesLogged");
let foodItemDivs = document.querySelectorAll(".foodItem");
const deleteFoodItems = document.querySelector("#foodItemLogs");
const deleteButton = document.querySelector(".deleteButton");
// automated default numb for chart to keep it same sized
const automatedNum = 10;

const API = new FetchWrapper(
  "https://firestore.googleapis.com/v1/projects/programmingjs-90a13/databases/(default)/documents/"
);

ApiGet();

// Submitting new foodItem
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = selectFoodType.value;
  const carbs = parseInt(inputCarbs.value);
  const protein = parseInt(inputProtein.value);
  const fat = parseInt(inputFat.value);

  await addAPI(name, carbs, protein, fat);
  form.reset();
  snackbar.show("New food item added!");
});

// Adding new food item to API
async function addAPI(nameValue, carbsValue, proteinValue, fatValue) {
  await API.post("foodtracker2022", {
    name,
    fields: {
      name: {
        stringValue: nameValue,
      },
      carbs: {
        integerValue: carbsValue,
      },
      protein: {
        integerValue: proteinValue,
      },
      fat: {
        integerValue: fatValue,
      },
    },
  });
  API.post("foodtracker", {});
  ApiGet();
}

// getting the API and creating html content
function ApiGet() {
  API.get("foodtracker2022").then((data) => {
    let totalCaloriesCalc = 0;
    foodItemsContainer.innerHTML = "";
    deleteFoodItems.innerHTML = "";
    if (data?.documents) {
      data?.documents.forEach((item) => {
        const nameUrl = item?.name.split("/")[6];

        const name = item?.fields?.name?.stringValue;
        const carbs = parseInt(item?.fields?.carbs?.integerValue);
        const protein = parseInt(item?.fields?.protein?.integerValue);
        const fat = parseInt(item?.fields?.fat?.integerValue);
        totalCaloriesCalc += caloriesCalc(carbs, protein, fat);

        foodItemsContainer.innerHTML += `<div class="foodItem">
    <h2>${name}</h2>
    <p>Calories ${caloriesCalc(carbs, protein, fat)}</p>
    <ul class="foodItemNutritionList">
      <li class="foodItemCarbs">Carbs ${carbs}</li>
      <li class="foodItemProtein">Protein ${protein}</li>
      <li class="foodItemFat">Fat ${fat}</li>
    </ul>
  </div>`;

        deleteFoodItems.innerHTML += `<option value="${nameUrl}">${name}</option>`;
      });
    }

    totalCalories.textContent = totalCaloriesCalc;

    //   setting info to the charts.js
    if (data?.documents) {
      const charCarbs = parseInt(
        data?.documents[0]?.fields?.carbs?.integerValue
      );
      const charProtein = parseInt(
        data?.documents[0]?.fields?.protein?.integerValue
      );
      const charFat = parseInt(data?.documents[0]?.fields?.fat?.integerValue);
      doChart.config.data.datasets[0].data[0] = charCarbs;
      doChart.config.data.datasets[0].data[1] = charProtein;
      doChart.config.data.datasets[0].data[2] = charFat;
      doChart.config.data.datasets[0].data[3] = automatedNum;
      doChart.update();
    }

    //   adding event listeners to foodItems in DOM
    foodItemDivs = document.querySelectorAll(".foodItem").forEach((item) =>
      item.addEventListener("click", (e) => {
        // carbs
        const carbs = parseInt(
          e.currentTarget.children[2].children[0].innerText.split(" ")[1]
        );

        //   protein
        const protein = parseInt(
          e.currentTarget.children[2].children[1].innerText.split(" ")[1]
        );

        //   fat
        const fat = parseInt(
          e.currentTarget.children[2].children[2].innerText.split(" ")[1]
        );

        doChart.config.data.datasets[0].data[0] = carbs;
        doChart.config.data.datasets[0].data[1] = protein;
        doChart.config.data.datasets[0].data[2] = fat;
        doChart.config.data.datasets[0].data[3] = automatedNum;
        doChart.update();
      })
    );
  });
}

// Calculating calories
const caloriesCalc = (carbs, protein, fat) => {
  return carbs * 4 + protein * 4 + fat * 9;
};

// the chart
const data = {
  labels: ["Carbs", "Protein", "Fat"],
  datasets: [
    {
      label: "Nutritional value in grams",
      data: [],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const config = {
  type: "bar",
  data,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

const doChart = new Chart(document.querySelector("#doChart"), config);

// delete
deleteButton.addEventListener("click", async (e) => {
  await API.delete(`foodtracker2022/${deleteFoodItems.value}`);
  ApiGet();
  snackbar.show("Food item deleted!");
});
