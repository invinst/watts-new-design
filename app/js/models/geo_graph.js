/* global google */

import _ from 'lodash';
// import * as d3 from 'd3';
import { select, selectAll } from 'd3-selection';
import moment from 'moment';
import d3tip from 'd3-tip';
import Graph from './graph';
import { customGoogleMapStyle, mapCenter, zoomLevel } from './geo_graph.conf';

export default class GeoGraph extends Graph {
  constructor(data, elementId) {
    super(data, elementId);

    this.force = null;
    this.gmap = null;
    this.setupGraph();
    this.setupToolTip();

    this.timelineIndex = 0;
    this.currentDateStr = null;
    this.nextDateStr = null;
  }

  setupGraph() {
    this.initGeographyMap();
    this.initComplaintNetwork();
  }

  updateGraph() {
    this.updateComplaintGraph();
  }

  setupToolTip() {
    this.tip = d3tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html((d) => {
        return '<p> CRID: ' + d.cr_id + '</p>' +
          '<p> Complaint Date: ' + d.complaint_date + '</p>';
      });
  }

  initGeographyMap() {
    this.gmap = new google.maps.Map(select('#geo-chart').node(), {
      zoom: zoomLevel,
      center: new google.maps.LatLng(mapCenter['lat'], mapCenter['lng']),
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      streetViewControl: false,
      scrollwheel: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      styles: customGoogleMapStyle
    });
  }

  initComplaintNetwork() {
    this.overlay = new google.maps.OverlayView();
    // Add the container when the overlay is added to the map.
    this.overlay.onAdd = () => {
      const layer = select(this.overlay.getPanes().overlayMouseTarget).append('div')
        .attr('class', 'complaints');

      // Draw all markers as single SVG only.
      this.overlay.draw = () => {
        const w = 4000,
          h = 4000;

        selectAll('#gvis').remove();
        this.svg = layer.append('svg')
          .attr('id', 'gvis')
          .attr('width', w)
          .attr('height', h)
          .style('transform', 'translate(-50vw, -50vh)')
          .call(this.tip);
        this.drawAllNodes();
        this.updateComplaintGraph();
      };
    };

    // Bind our overlay to the map…
    this.overlay.setMap(this.gmap);
  }

  updateComplaintGraph() {
    if (typeof this.node === 'undefined')
      return;

    const duringNodes = this.node.filter((d) => {
      return (d.complaint_date < this.nextDateStr) && (d.complaint_date >= this.currentDateStr);
    });
    const beforeNodes = this.node.filter((d) => (d.complaint_date < this.currentDateStr));
    const afterNodes = this.node.filter((d) => (d.complaint_date >= this.nextDateStr));

    duringNodes.attr('class', 'gnode during-complaint');
    beforeNodes.attr('class', 'gnode before-complaint');
    afterNodes.attr('class', 'gnode after-complaint');

    // move the duringNodes to front
    duringNodes.raise();

    // TODO: set `highlight` class, remove old classes and add the right class
  }

  drawAllNodes() {
    const complaints = this.data.gnodes;
    selectAll('.gnode').remove();

    if (typeof this.svg === 'undefined')
      return;

    this.node = this.svg.selectAll('.complaints').data(complaints);

    this.node.exit().remove();

    this.node = this.node.enter()
      .append('g')
      .attr('id', (d) => 'complaint-' + d.cr_id)
      .style('transform', (d) => this._transform(d))
      .attr('class', 'gnode after-complaint')
      .merge(this.node);

    this.node.append('circle')
      .attr('r', 4.5)
      // .attr('fill', (d) => {
      //   if (d['complaint_date'] === this.currentDate)
      //     return '#A00';
      //   else
      //     return '#0AA';
      // })
      .attr('class', 'marker')
      .attr('cursor', 'pointer')
      .on('mouseover', (d, i, nodes) => {
        this.tip.show(d, nodes[i]);
      })
      .on('mouseout', this.tip.hide);
  }

  _transform(d) {
    const padding = 0;
    let p = new google.maps.LatLng(d.lat, d.lng);
    p = this.overlay.getProjection().fromLatLngToDivPixel(p);
    p.x = p.x - padding;
    p.y = p.y - padding;
    // console.warn('translate(calc(' + p.x + 'px + 50vw), calc(' + p.y + '+50vh))' )
    return 'translate(calc(' + p.x + 'px + 50vw), calc(' + p.y + 'px + 50vh))';
  }

  recalculateValidComplaints() {
    const _complaints = this.data.gnodes;
    const _currentDate = moment(this.currentDate);
    const _unsortedComplaints = _.filter(_complaints, (c) => {
      return (moment(c['complaint_date']) <= _currentDate) &&
        (!this.showCivilComplaintOnly || !c['by_officer']) &&
        (this.accumulatingDays === 0 ||
          _currentDate.diff(moment(c['complaint_date']), 'days') <= this.accumulatingDays);
    });
    return _.sortBy(_unsortedComplaints, 'complaint_date');
  }

  setHighlightNode(crid, toogle = true) {
    const complaintNode = select('#complaint-' + crid);
    if (complaintNode.node() === null)
      return;
    if (toogle)
      this.tip.show(complaintNode.datum(), complaintNode.select('circle').node());
    else
      this.tip.hide();
    complaintNode.selectAll('circle')
      // .classed('pulse-animation', toggle)
      .classed('blink-animation', toogle);
  }

  refinePeriod(currentDateStr, nextDateStr) {
    // TODO: impl this
    // const currentDate = moment(currentDateStr);
    // const nextDate = moment(nextDateStr);
    return [currentDateStr, nextDateStr];
  }

  setActivePeriod(fromDateStr, toDateStr) {
    // this.setCurrentDate(currentDateStr);
    const [currentDateStr, nextDateStr] = this.refinePeriod(fromDateStr, toDateStr);

    this.currentDateStr = currentDateStr;
    this.nextDateStr = nextDateStr;

    this.updateGraph();
  }
}
