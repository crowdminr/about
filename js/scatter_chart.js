d3.chart('BaseChart').extend('ScatterChart', {
  initialize: function() {
    var chart = this;

    chart.w = 820;

    // default chart ranges
    chart.x = d3.scale.linear()
      .range([0, chart.w - chart.margins.left]);

    chart.base
      .classed('Areachart', true);

    chart.areas.rate = chart.base.append('g')
      .classed('rate', true)
      .attr('width', chart.w - chart.margins.left)
      .attr('height', chart.h - chart.margins.bottom - chart.margins.top)
      .attr('transform', 'translate(' + chart.margins.left + ',' + chart.margins.top+')');

    // make actual layers
    chart.layer('circles', chart.areas.plot, {
      // data format:
      // [ { netPresentValue: 55.3, probability: 20 }, ...]
      dataBind : function(data) {

        // save the data in case we need to reset it
        chart.data = data;

        // adjust the x domain - the number of bars.
        var xmax = d3.max(data, function(d) {
          return d.netPresentValue;
        });

        chart.x.domain([0, xmax + 3]);

        chart.y.domain([0, 1.05]);

        // draw yaxis
        var yAxis = d3.svg.axis()
          .scale(chart.y)
          .orient('left')
          .ticks(4)
          .tickFormat(chart.y.tickFormat(4, '%'));

        chart.areas.ylabels
          .call(yAxis);

        return this.selectAll('circle')
          .data(data);
      },

      insert : function() {
        return this.append("circle")
          .classed('circle', true)
          .attr({
            cx: function(d) { return chart.x(+d.netPresentValue); },
            cy: function(d) { return chart.y(+d.probability); },
            r: 8,
            id: function(d) { return d.country; }
          });
        }
    });

    chart.layer('interestRate', chart.areas.rate, {
      dataBind : function(data) {
        var interestRate = data.reduce(function(acc, outcome) {
          return acc + outcome.netPresentValue * outcome.probability;
        }, 0);
        console.log(interestRate);

        return this.selectAll('line')
          .data([interestRate])
      },
      insert: function() {
        return this.append("line")
          .classed('interest', true)
          .attr({
            x1: function(d) { return chart.x(+d); },
            y1: chart.y(0),
            x2: function(d) { return chart.x(+d); },
            y2: chart.y(1),
            style: "stroke:rgb(255,0,0);stroke-width:2"
          })
      }
    });

    // a layer for the x text labels.
    chart.layer('xlabels', chart.areas.xlabels, {
      dataBind : function(data) {
        // first append a line to the top.
        this.append('line')
          .attr('x1', 0)
          .attr('x2', chart.w - chart.margins.left)
          .attr('y1', 0)
          .attr('y2', 0)
          .style('stroke-width', '1')
          .style('shape-rendering', 'crispEdges');


        return this.selectAll('text')
          .data(data);
      },
      insert : function() {
        return this.append('text')
          .classed('label', true)
          .attr('text-anchor', 'middle')
          .attr('x', function(d, i) {
            return chart.x(i) - 0.5 + chart.bar_width/2;
          })
          .attr('dy', '1em')
          .text(function(d) {
            return d.name;
          });
      }
    });

    // on new/update data
    // render the circles.
    var onEnter = function() {
      this.attr('cx', function(d) {
            return chart.x(d.netPresentValue);
          })
          .attr('cy', function(d) {
            return chart.h - chart.margins.bottom - chart.margins.top - chart.y(1 - d.probability);
          })
          .attr('val', function(d) {
            return d.netPresentValue;
          })
    };

    var onRateEnter = function() {
      var xpos = function(d) { return chart.x(+d); };
      this.attr({
        x1: xpos,
        x2: xpos,
      });
    }

    chart.layer('circles').on('enter', onEnter);
    chart.layer('circles').on('update', onEnter);
    chart.layer('interestRate').on('update', onRateEnter);
  }
});

