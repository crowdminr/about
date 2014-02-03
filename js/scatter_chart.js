d3.chart('BaseChart').extend('ScatterChart', {
  initialize: function() {
    var chart = this;

    chart.base
      .classed('Areachart', true);

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

        chart.y.domain([0, 1]);

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

    chart.layer('circles').on('enter', onEnter);
    chart.layer('circles').on('update', onEnter);
  }
});

