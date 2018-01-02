import _ from 'lodash';
import { xml as readXML } from 'd3';
import { select, selectAll } from 'd3-selection';
import * as d3Force from 'd3-force';
import { scaleLinear } from 'd3-scale';
import d3tip from 'd3-tip';
import moment from 'moment';
import Graph from './graph';


export default class SocialGraph extends Graph {
  constructor(data, elementId) {
    super(data, elementId);

    this.width = 400;
    this.height = 400;

    this.maxWeight = 0;
    this.linkedByIndex = {};

    this.thresholdValue = 1;

    this.optionCustomNode = false;

    this.setupGraph();
    this.setupToolTip();
    this.timelineIndex = 0;

    this._fill = scaleLinear()
      .domain([0, 40])
      .range(['#F3C2C2', '#FF4F5D', '#FF0006', '#D40003', '#B10002']);
  }


  setupGraph() {
    this.graph = d3Force.forceSimulation()
      .velocityDecay(0.9)
      .force('charge', d3Force.forceManyBody().strength(-800).distanceMin(100).distanceMax(400))
      .force('collide', d3Force.forceCollide((d) => d.r + 8).iterations(16))
      .force('center', d3Force.forceCenter(this.width / 2, this.height / 2))
      .force('y', d3Force.forceY(0.001))
      .force('x', d3Force.forceX(0.001))
      .nodes(this.data.nodes)
      .force('link', d3Force.forceLink(this.data.links))
      .on('tick', () => this.tick());

    this.svg = select(`#${this._elementId}`).append('svg:svg')
      .attr('width', '100%')
      .attr('height', this.height)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    if (this.optionCustomNode) {
      readXML('img/officer_2.svg', (xml) => {
        let importedNode = document.importNode(xml.documentElement, true).getElementsByTagName('g')[0];

        const defs = this.svg.append('defs');
        defs.append('g')
          .attr('id', 'officerAvatar')
          .attr('viewBox', '-50 -50 100 100')
          .attr('transform', 'scale(0.03)')
          .node().appendChild(importedNode);
      });
    }

    this.node = this.svg.selectAll('.node');
    this.link = this.svg.selectAll('.link');
  }

  setupToolTip() {
    this.tip = d3tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html((d) => `<span> ${d.full_name} (${d.uid}) </span>`);
    this.svg.call(this.tip);
  }

  updateGraph() {
    let [newNodes, newLinks] = this.recalculateNodeLinks();

    this.updateNodes(newNodes);
    this.updateLinks(newLinks);

    // Update and restart the simulation.
    this.graph.nodes(newNodes);
    this.graph.force('link').links(newLinks);
    this.graph.alpha(1).restart();
  }

  updateLinks(newLinks) {
    this.graph.force('link').links(newLinks);
    this.link = this.link.data(newLinks, (d) => {
      const ids = [d.source.id, d.target.id].sort();
      return `${ids[0]}-${ids[1]}`;
    });
    this.link.exit().remove();
    this.link = this.link.enter().insert('line', '.node')
      .attr('class', 'link')
      .merge(this.link)
      .attr('stroke-width', (d) => Math.ceil(Math.sqrt(d.weight)))
      .classed('highlight', (d) => d.highlight);
  }

  updateNodes(newNodes) {
    const joinData = this.node.data(newNodes);

    // REMOVE OLD NODES
    joinData.exit().remove();

    // INSERT NEW NODES
    const enteringNodes = joinData.enter()
      .insert('g', '.cursor')
      .attr('class', 'node')
      .attr('id', (d) =>'officer-' + d.uid);
    enteringNodes.append('text')
      .attr('x', 12)
      .attr('dy', '0.35em')
      .text((d) =>d.full_name.split(/\s+/)[0]);

    let nodeIcons;
    if (this.optionCustomNode) {
      nodeIcons = enteringNodes.append('use')
        .attr('xlink:href', '#officerAvatar')
        .attr('fill', (d) => this._fill(d.numComplaints));
    } else {
      nodeIcons = enteringNodes.append('circle');
    }

    nodeIcons
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);


    // UPDATE ALL NODES
    const allNodes = enteringNodes.merge(joinData);
    allNodes.selectAll('circle')
      .attr('r', (d) => (d.degree / 2 + 3))
      .attr('fill', (d) => this._fill(d.numComplaints));

    this.node = allNodes; // UPDATE start here (new in v4)
  }

  tick() {
    if (typeof this.node === 'undefined')
      return;
    const radius = 10;
    if (this.optionCustomNode) {
      this.node
        .each((d) => {
          d.x = Math.max(radius, Math.min(this.width - radius, d.x));
          d.y = Math.max(radius, Math.min(this.height - radius, d.y));
        })
        .attr('transform', (d) => {
          const paddingCustom = (3 + (d.degree * 2));
          return `translate(${d.x - paddingCustom} ,${d.y - 3 - paddingCustom})`;
        })
        .selectAll('use')
        .attr('transform', (d) => `scale(${d.degree / 2 + 1})`);
    } else {
      this.node.selectAll('circle').attr('cx', (d) => {
        return d.x = Math.max(radius, Math.min(this.width - radius, d.x));
      }).attr('cy', (d) => {
        return d.y = Math.max(radius, Math.min(this.height - radius, d.y));
      });
      this.node.selectAll('text').attr('transform', (d) => `translate(${d.x} ,${d.y})`);
    }

    this.link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

  }

  _cleanNeighbor() {
    this.linkedByIndex = {};
  }

  saveNeighbor(node1, node2) {
    this.linkedByIndex[node1.id + ',' + node2.id] = true;
    this.linkedByIndex[node2.id + ',' + node1.id] = true;
  }

  getCurrentNumComplaints(node) {
    if (this.currentDate) {
      return this.data.graph.updating_by_date.officer_complaints[this.currentDate][node.uid] || 0;
    }
    else
      return 0;
  }

  recalculateNodeLinks() {
    this.maxWeight = 0;
    this._cleanNeighbor();

    let links = this._recalculateLinks();
    let nodes = this._recalculateNodes(links);
    return [nodes, links];
  }

  _recalculateLinks() {
    /*
    select links which has complaints before the current date
    update link weight
    mark highlight
     */
    if (!this.currentDate)
      return [];

    else {
      return _.reduce(this.data.links, (acc, link) => {
        const complaints = this.filterValidComplaint(link['complaints']);
        if (complaints.length < this.thresholdValue) {
          return acc;
        }
        else {
          if (this.maxWeight < complaints.length) {
            this.maxWeight = complaints.length;
          }

          const highlight = _.some(complaints, { 'complaint_date': this.currentDate });
          acc.push({
            'weight': complaints.length,
            'source': link.source,
            'target': link.target,
            'highlight': highlight
          });
          return acc;
        }
      }, []);
    }

  }

  _recalculateNodes(links) {
    /*
    update nodes degree and numComplaints, neighbors
     */
    let nodes = this.data.nodes;
    nodes.forEach((n) => {
      n.degree = 0;
      n.numComplaints = this.getCurrentNumComplaints(n);
    });

    links.forEach((link) => {
      this.saveNeighbor(link.source, link.target);
      // recalculate degree of node
      nodes[link.source.id].degree += 1;
      nodes[link.target.id].degree += 1;
    });
    return nodes;
  }

  filterValidComplaint(complaints) {
    const _currentDate = moment(this.currentDate);
    return _.filter(complaints, (c) => {
      return (moment(c['complaint_date']) <= _currentDate) &&
        (!this.showCivilComplaintOnly || !c['by_officer']) &&
        (this.accumulatingDays === 0 ||
          _currentDate.diff(moment(c['complaint_date']), 'days') <= this.accumulatingDays);
    });
  }

  setHighlightNode(uid, toggle = true) {
    this.setHighlightNodes([uid], toggle);
  }

  setHighlightNodes(uids, toggle = true) {
    if (typeof uids === 'undefined' || uids.length === 0)
      return;

    const listNodeId = uids.map((d) => '#officer-' + d);
    const officerNodes = selectAll(listNodeId.join());
    this._highlightCirclesAndTexts(officerNodes, toggle);
  }

  unsetHighlightNodes() {
    this._highlightCirclesAndTexts(this.node, false);
  }

  _highlightCirclesAndTexts(target, toggle) {
    target.selectAll('circle').classed('blink-animation', toggle);
    target.selectAll('text').classed('active', toggle);
  }
}
