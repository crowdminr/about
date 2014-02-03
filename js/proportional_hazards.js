document.addEventListener("DOMContentLoaded", function() {
  function cumulative(array) {
    var memo = 0.0, accumulator = [0.0];
    array.forEach(function(e) {
      accumulator.push(memo += e);
    });
    return accumulator;
  }

  function arrayProduct(a1, a2) {
    var product = [], length = a1.length;
    for(i=0;i<length;++i)
      product.push(a1[i] * a2[i]);
    return product;
  }

  function randomData() {
    var data = [];
    for(var i=0; i<12; i++) {
      var percentage = (15.0 + 15.0 * Math.random()) / 100;
      data.push(percentage);
    }
    return data;
  }

  function monthFormat(data) {
    result = [
      { name : 'JAN', value : data[0] },
      { name : 'FEB', value : data[1] },
      { name : 'MAR', value : data[2] },
      { name : 'APR', value : data[3] },
      { name : 'MAY', value : data[4] },
      { name : 'JUN', value : data[5] },
      { name : 'JUL', value : data[6] },
      { name : 'AUG', value : data[7] },
      { name : 'SEP', value : data[8] },
      { name : 'OCT', value : data[9] },
      { name : 'NOV', value : data[10] },
      { name : 'DEC', value : data[11] }
    ];
    // cumulative not marginal values
    if(data.length == 13)
      result[12] = { name : 'NOT', value : data[12] }

    return result;
  }

  function npvFormat(npv, probability) {
    // [ { netPresentValue: 55.3, probability: 20 }, ...]
    result = d3.zip(npv, probability).map(function(outcome) {
      return {netPresentValue: outcome[0], probability: outcome[1]};
    });

    // append 'never defaulting' result
    result.push({
      netPresentValue: npv[12],
      probability: 1 - d3.sum(probability)
    });

    return result;
  }

  // probabilities
  var hazardData = randomData();

  // static graphs
  // Net Present Payment Value
  var netPresentPaymentValues = [],
      netPresentCumulativeValue = 0,
      netPresentCumulativeValues = [0];

  for(month=1; month<=12; ++month) {
    var netPresentPaymentValue = 10.0 * Math.exp(-0.1 * month);
    netPresentCumulativeValue += netPresentPaymentValue;
    netPresentPaymentValues.push(netPresentPaymentValue);
    netPresentCumulativeValues.push(netPresentCumulativeValue);
  }

  d3.select("svg#net-present-payment-value")
    .chart('BarChart')
    .displayYAxis(false)
    .draw(monthFormat(netPresentPaymentValues))

  d3.select("svg#net-present-cumulative-value")
    .chart('BarChart')
    .displayYAxis(false)
    .draw(monthFormat(netPresentCumulativeValues))

  // dynamic graphs
  var hazardChart = d3.select("svg#hazard").chart('BarChart')
                      .max(d3.max(hazardData));
  var marginalDefaultChart = d3.select("svg#marginal-default").chart('BarChart')
                        .max(d3.max(marginalDefault(hazardData)));
  var returnDistributionChart = d3.select("svg#return-distribution").chart('ScatterChart');
  // probability for each month that
  //   a) The loan hasn't defaulted yet AND
  //   b) the loan will default this month
  function marginalDefault(hazard) {
    cumulativeHazard = cumulative(hazard);

    var survivalUntilNow, defaultsNow, result = [];

    for(i=0; i<12; ++i) {
      survivalUntilNow = Math.exp(-cumulativeHazard[i]);
      defaultsNow = 1 - Math.exp(-hazard[i]);
      result.push(survivalUntilNow * defaultsNow);
    }

    return result;
  }

  function redraw(frailty) {
    var adjustedHazardData = hazardData.map(function(h) { return h * parseFloat(frailty) });
    hazardChart.draw(monthFormat(adjustedHazardData));

    var marginalDefaultProbabilities = marginalDefault(adjustedHazardData);
    marginalDefaultChart.draw(monthFormat(marginalDefaultProbabilities));

    var valueDistribution = npvFormat(netPresentCumulativeValues, marginalDefaultProbabilities);
    returnDistributionChart.draw(valueDistribution);
  }

  var slider = document.getElementById('frailty');

  var h = document.getElementById('h'),
      quoteElement = document.getElementById('borrower-quote');

  function updateQuote(frailty) {
    var quote;
    if(frailty > 0.66) quote = 'I live in a dumpster.'
    else if(frailty > 0.33) quote = "I'm an PhD student."
    else quote = "I own Facebook."
    quoteElement.innerHTML = quote;
  }

  function updateMaths(frailty) {
    h.innerHTML = frailty;
  }

  function updateFrailty(frailty) {
    updateQuote(frailty);
    updateMaths(frailty);
    redraw(frailty);
  }

  slider.onchange = function() {
    updateFrailty(this.value);
  };

  updateFrailty(slider.value);
}, false);
