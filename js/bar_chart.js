d3.chart('BaseChart').extend('BarChart', {
  initialize: function() {
    var chart = this;

    chart.base
      .classed('Barchart', true);

    chart.w = chart.base.attr('width') || 400;

    // make actual layers
    chart.layer('bars', chart.areas.plot, {
      // data format:
      // [ { name : x-axis-bar-label, value : N }, ...]
      dataBind : function(data) {

        // save the data in case we need to reset it
        chart.data = data;

        // how many bars?
        chart.bars = data.length;

        // compute box size
        chart.bar_width = (chart.w - chart.margins.left - ((chart.bars - 1) *
          chart.margins.padding)) / chart.bars;

        // adjust the x domain - the number of bars.
        chart.x.domain([0, chart.bars]);

        // adjust the y domain - find the max in the data.
        chart.datamax = chart.usermax || d3.max(data, function(d) { 
          return d.value; 
        });

        chart.y.domain([0, chart.datamax]);

        // draw yaxis
        var yAxis = d3.svg.axis()
          .scale(chart.y)
          .orient('left')
          .ticks(4)
          .tickFormat(chart.y.tickFormat(4, '%'));

        if(chart.displayYAxis) {
          chart.areas.ylabels
            .call(yAxis);
        }

        return this.selectAll('rect')
          .data(data);
      },

      insert : function() {
        return this.append('rect')
          .classed('bar', true);
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
    // render the bars.
    var onEnter = function() {
      this.attr('x', function(d, i) {
            return chart.x(i) - 0.5;
          })
          .attr('y', function(d) {
            return chart.h - chart.margins.bottom - chart.margins.top - chart.y(chart.datamax - d.value) - 0.5;
          })
          .attr('val', function(d) {
            return d.value;
          })
          .attr('width', chart.bar_width)
          .attr('height', function(d) {
            //return chart.h - chart.margins.bottom - chart.y(chart.datamax - d.value);
            return chart.y(chart.datamax - d.value);
          });
    };

    chart.layer('bars').on('enter', onEnter);
    chart.layer('bars').on('update', onEnter);
  }
});

