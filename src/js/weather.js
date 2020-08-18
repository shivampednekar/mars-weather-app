const API_KEY = 'process.env';
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;
console.log(API_KEY);

// current seleters
const currentSolElement = document.querySelector('[data-current-sol]');
const currentDateElement = document.querySelector('[data-current-date]');
const currentTempHighElement = document.querySelector(
  '[data-current-temp-high]'
);
const currentTempLowElement = document.querySelector('[data-current-temp-low]');
const windSpeedElement = document.querySelector('[data-wind-speed]');
const windDirectionText = document.querySelector('[data-wind-direction-text]');
const windDirectionArrow = document.querySelector(
  '[data-wind-direction-arrow]'
);

//previous seleters
const previousSolTemplate = document.querySelector(
  '[data-previous-sol-template]'
);
const previousSolContainer = document.querySelector('[data-previous-sols]');

//toogle
const unitToogle = document.querySelector('[data-unit-toogle]');
const metricRadio = document.getElementById('cel');
const imperialRadio = document.getElementById('fah');

let selectedSolIndex;

getWeather().then((sols) => {
  selectedSolIndex = sols.length - 1;
  displaySelectedSol(sols);
  displayPreviousSols(sols);
  updateUnits();
  // console.log(sols);

  unitToogle.addEventListener('click', () => {
    //change toogle
    let metricUnits = !isMetric();
    metricRadio.checked = metricUnits;
    imperialRadio.checked = !metricUnits;
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });

  metricRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });

  imperialRadio.addEventListener('change', () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });
});

//current element data
function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  currentSolElement.innerText = selectedSol.sol;
  currentDateElement.innerText = displayDate(selectedSol.date);
  currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp);
  currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp);
  windSpeedElement.innerText = displaySpeed(selectedSol.windSpeed);
  windDirectionArrow.style.setProperty(
    '--direction',
    `${selectedSol.windDirectionDegrees}deg`
  );
  windDirectionText.innerText = selectedSol.windDirectionCardinal;
}

//previous sols data
function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = '';
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true);
    solContainer.querySelector('[data-sol]').innerText = solData.sol;
    solContainer.querySelector('[data-date]').innerText = displayDate(
      solData.date
    );
    solContainer.querySelector(
      '[data-temp-high]'
    ).innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector(
      '[data-temp-low]'
    ).innerText = displayTemperature(solData.minTemp);
    solContainer
      .querySelector('[data-select-button]')
      .addEventListener('click', () => {
        selectedSolIndex = index;
        displaySelectedSol(sols);
      });
    previousSolContainer.appendChild(solContainer);
  });
}

//config date
function displayDate(date) {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
}

//config maxTemp & minTemp
function displayTemperature(temperature) {
  let returnTemp = temperature;
  if (!isMetric()) {
    returnTemp = (temperature - 32) * (5 / 9);
  }
  return Math.round(returnTemp);
}

//config wind speeed
function displaySpeed(speed) {
  let returnSpeed = speed;
  if (!isMetric()) {
    returnSpeed = speed / 1.609;
  }
  return Math.round(returnSpeed);
}

//config
function getWeather() {
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const { sol_keys, validity_checks, ...solData } = data;
      // console.log(solData);
      return Object.entries(solData).map(([sol, data]) => {
        return {
          sol: sol,
          maxTemp: data.AT.mx,
          minTemp: data.AT.mn,
          windSpeed: data.HWS.av,
          windDirectionDegrees: data.WD.most_common.compass_degrees,
          windDirectionCardinal: data.WD.most_common.compass_point,
          date: new Date(data.First_UTC),
        };
      });
    });
}

function updateUnits() {
  const speedUnits = document.querySelectorAll('[data-speed-unit]');
  const tempUnits = document.querySelectorAll('[data-temp-unit]');

  //auto spped unit
  speedUnits.forEach((unit) => {
    unit.innerText = isMetric() ? 'kph' : 'mph';
  });

  //auto temp unit
  tempUnits.forEach((unit) => {
    unit.innerText = isMetric() ? 'C' : 'F';
  });
}

function isMetric() {
  return metricRadio.checked;
}
