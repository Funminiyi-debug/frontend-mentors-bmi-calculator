// Wait for the DOM to fully load before running the script
document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  function resetInputs() {
    document.querySelector("#height_input_imperial_1").value = "";
    document.querySelector("#height_input_imperial_2").value = "";
    document.querySelector("#weight_input_imperial_1").value = "";
    document.querySelector("#weight_input_imperial_2").value = "";

    document.querySelector("#height_input_metric").value = "";
    document.querySelector("#weight_input_metric").value = "";

    document.querySelector(".uncalculated").classList.remove("hide");
    document.querySelector(".calculated").classList.add("hide");
  }

  function imperialPoundsWeightToDecimal(st, lbs) {
    return st * 14 + +lbs;
  }
  function imperialInchesHeightToDecimal(ft, inch) {
    return ft * 12 + +inch;
  }

  function calculateIdealWeightRange(height, gender, unit) {
    let heightInInches;

    // Convert height to inches if in metric
    if (unit.toLowerCase() === "metric") {
      heightInInches = height / 2.54; // 1 inch = 2.54 cm
    } else if (unit.toLowerCase() === "imperial") {
      heightInInches = height;
    } else {
      return "Unknown unit";
    }

    let baseIdealWeight;
    if (gender.toLowerCase() === "male") {
      baseIdealWeight = 48 + 1.1 * (heightInInches - 60);
    } else if (gender.toLowerCase() === "female") {
      baseIdealWeight = 45.5 + 0.9 * (heightInInches - 60);
    } else {
      return "Unknown gender";
    }

    // Convert the weight back to kg if the input was in metric and calculate the range
    let conversionFactor = unit.toLowerCase() === "metric" ? 2.2 : 1; // 1 kg = 2.2 lbs
    let idealWeightKg = baseIdealWeight / conversionFactor;
    let lowerBound = idealWeightKg * 0.9;
    let upperBound = idealWeightKg * 1.1;

    return `${lowerBound.toFixed(2)}kg - ${upperBound.toFixed(2)}kg`;
  }

  // Define a function to update the element's text
  function calculateBMI(height, weight, unit) {
    height = Number(height);
    weight = Number(weight);

    if (isNaN(height) || isNaN(weight)) return;
    if (height < 1 || weight < 1) return;

    switch (unit) {
      case "metric":
        height = height / 100;
        return weight / (height * height);
      case "imperial":
        return (weight / (height * height)) * 703;
      default:
        throw "invalid unit";
    }
  }

  // calculates BMI for metric unit
  function calculateBMIForMetric() {
    const height = document.querySelector("#height_input_metric").value;
    const weight = document.querySelector("#weight_input_metric").value;

    const bmi = calculateBMI(height, weight, "metric");

    return { bmi, height, weight, unit: "metric" };
  }

  // calculates BMI for imperial unit
  function calculateBMIForImperial() {
    const heightFt = document.querySelector("#height_input_imperial_1").value;
    const heightInch = document.querySelector("#height_input_imperial_2").value;
    const weightSt = document.querySelector("#weight_input_imperial_1").value;
    const weightLbs = document.querySelector("#weight_input_imperial_2").value;

    const height = imperialInchesHeightToDecimal(heightFt, heightInch);
    const weight = imperialPoundsWeightToDecimal(weightSt, weightLbs);

    const bmi = calculateBMI(height, weight, "imperial");

    return { bmi, height, weight, unit: "imperial" };
  }

  // displays result on the ui
  function displayResult(bmi, category, weight, height, unit, range) {
    // hide the welcome section
    document.querySelector(".uncalculated").classList.add("hide");
    document.querySelector(".calculated").classList.remove("hide");

    if (typeof bmi == "undefined") {
      bmi = 0;
    }

    document.querySelector("#bmi-category").textContent =
      category.toLowerCase();
    document.querySelector("#bmi-result").textContent = bmi.toFixed(2);
    document.querySelector("#bmi-range").textContent = range.toLowerCase();
  }

  // determines if the category is obese, overweight, healthy or malnourished
  function determineBMICategory(bmi, weight, height, unit) {
    let category = "";

    if (bmi < 18.5) {
      category = "Under";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      category = "Healthy";
    } else if (bmi >= 25 && bmi <= 29.9) {
      category = "Over";
    } else if (bmi >= 30) {
      category = "Obese";
    } else {
      category = "Invalid BMI";
    }

    return category;
  }

  // retrieves input from input forms
  function retrieveInput(e) {
    let result = {
      bmi: 0,
      height: 0,
      weight: 0,
      unit: "",
    };
    // get current metric
    const currentUnit = [
      ...document.querySelectorAll("input[type='radio']"),
    ].find((c) => c.checked).id;

    console.log("currentUnit", currentUnit);
    if (typeof currentUnit == "undefined") return;

    if (currentUnit == "metric") {
      result = calculateBMIForMetric();
    } else {
      result = calculateBMIForImperial();
    }

    const { bmi, height, weight, unit } = result;

    const bmiCategory = determineBMICategory(bmi, weight, height, unit);
    const range = calculateIdealWeightRange(height, "male", unit);

    displayResult(bmi, bmiCategory, weight, height, unit, range);
  }

  function changeUnit(e) {
    let unit;
    const metric = e.target.id == "metric";
    const imperial = e.target.id == "imperial";

    resetInputs();

    if (metric) {
      unit = metric;
      // change the text
      document.querySelector(".imperial").classList.add("hide");
      document.querySelector(".metric").classList.remove("hide");
    } else {
      unit = imperial;
      document.querySelector(".metric").classList.add("hide");
      document.querySelector(".imperial").classList.remove("hide");
    }
  }

  // listen for change on the radio toggle
  [...document.querySelectorAll("input[type='radio']")].map((e) => {
    e.addEventListener("change", changeUnit);
  });

  [...document.querySelectorAll("input[type='number']")].map((e) => {
    e.addEventListener("change", retrieveInput);
  });
});
