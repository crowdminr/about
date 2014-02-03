d3.chart("BaseChart", {
  initialize: function() {
    var chart = this;

    chart.base
      .classed('Basechart', true);

    // default height and width
    chart.w = chart.base.attr('width') || 400;
    chart.h = chart.base.attr('height') || 150;

    // chart margins to account for labels.
    // we may want to have setters for this
    // if we were letting the users customize this too
    chart.margins = {
      top : 10,
      bottom : 40,
      left : 80,
      right : 0,
      padding : 10
    };

    // default chart ranges
    chart.x =  d3.scale.linear()
      .range([0, chart.w - chart.margins.left]);

    chart.y = d3.scale.linear()
      .range([chart.h - chart.margins.bottom, 0]);

    // non data driven areas (as in not to be independatly drawn)
    chart.areas = {};

    // make sections for labels and main area
    //  _________________
    // |Y|    plot      |
    // | |              |
    // | |              |
    // | |              |
    // | |______________|
    //   |      X       |

    // -- areas
    chart.areas.xlabels = chart.base.append('g')
      .classed('xlabels', true)
      .attr('width', chart.w - chart.margins.left)
      .attr('height', chart.margins.bottom)
      .attr('transform', 'translate(' + chart.margins.left + ',' +
        (chart.h - chart.margins.bottom) + ')');

    chart.areas.plot = chart.base.append('g')
      .classed('plot', true)
      .attr('width', chart.w - chart.margins.left)
      .attr('height', chart.h - chart.margins.bottom - chart.margins.top)
      .attr('transform', 'translate(' + chart.margins.left + ',' + chart.margins.top+')');

    chart.areas.ylabels = chart.base.append('g')
      .classed('ylabels', true)
      .attr('width', chart.margins.left)
      .attr('height', chart.h - chart.margins.bottom - chart.margins.top)
      .attr('transform', 'translate('+(chart.margins.left-1)+',0)');
  },
  // return or set the max of the data. otherwise
  // it will use the data max.
  max : function(datamax) {
    if (!arguments.length) {
      return this.usermax;
    }

    this.usermax = datamax;

    if(this.data) this.draw(this.data);

    return this;
  },

  width : function(newWidth) {
    if (!arguments.length) {
      return this.w;
    }
    // save new width
    this.w = newWidth;

    // adjust the x scale range
    this.x =  d3.scale.linear()
      .range([this.margins.left, this.w - this.margins.right]);

    // adjust the base width
    this.base.attr('width', this.w);

    this.draw(this.data);

    return this;
  },

  height : function(newHeight) {
    if (!arguments.length) {
      return this.h;
    }

    // save new height
    this.h = newHeight;

    // adjust the y scale
    this.y = d3.scale.linear()
      .range([this.h - this.margins.top, this.margins.bottom]);

    // adjust the base width
    this.base.attr('height', this.h);

    this.draw(this.data);
    return this;
  },

  displayYAxis: function(display) {
    if (!arguments.length) {
      return this.displayYAxis;
    }

    // save new height
    this.displayYAxis = display;

    return this;
  },

});
