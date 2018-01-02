/* global data */
/* exported google */


import GoogleMapsLoader from 'google-maps';
import { googleKey } from './models/geo_graph.conf';
import { select, selectAll } from 'd3-selection';

import ScrollMagic from 'scrollmagic/scrollmagic/uncompressed/ScrollMagic';
import 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap';
import 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators';
import TimelineLite from 'gsap/src/uncompressed/TimelineLite';

import SocialGraph from './models/social_graph';
import GeoGraph from './models/geo_graph';
import * as StoryTimeline from './models/timeline';


var google; // eslint-disable-line no-unused-vars

const controller = new ScrollMagic.Controller(); // init controller

if (typeof data !== 'undefined') {

  window._socialGraph = new SocialGraph(data, 'chart');
  GoogleMapsLoader.KEY = googleKey;
  GoogleMapsLoader.load((gg) => {
    google = gg;
    window._geoGraph = new GeoGraph(data, 'geo-chart');

    // BUILD SCENES
    new ScrollMagic.Scene({
      triggerElement: '#timeline',
      offset: 100,
      triggerHook: 'onLeave'
    }).on('add', function (event) {
      StoryTimeline.fixSmallHeightWindow();
    }).on('enter', function (event) {
      select('.abstract').classed('hidden', true);
      StoryTimeline.fixSmallHeightWindow(false);
      select('#chart').classed('hide', false);
    }).on('leave', function (event) {
      select('.abstract').classed('hidden', false);
      StoryTimeline.fixSmallHeightWindow();
      select('#chart').classed('hide', true);
    })
    // .addIndicators({ name: `(duration: 150)` }) // add indicators (requires plugin)
      .addTo(controller);


    for (let i = 0; i < data.numScene - 1; i++) {
      new ScrollMagic.Scene({
        triggerElement: '#trigger-' + (i + 1),
        offset: 0,
        duration: 129
      })
        .addIndicators({ name: `${i + 1} (duration: 150)` }) // add indicators (requires plugin)
        .on('enter', function (event) {
          const idx = parseInt(event.target.triggerElement().id.split('-')[1]);
          StoryTimeline.scrollToCard(idx);
          StoryTimeline.updateGraphs(idx);

          let tl = new TimelineLite();
          tl.fromTo('.active-card .description, .active-card .date-title', 0.5, { opacity: 0 }, { opacity: 1 })
            .staggerFrom('.active-card .involved-officers li', 0.5, { scale: 0, autoAlpha: 0 }, 0.2, '-=0.25');

          // tl.from('.active-card .description', 0.5, { autoAlpha: 0 })
          //   .staggerFrom('.active-card .involved-officers li', 0.5, { scale: 0, autoAlpha: 0 }, 0.2);
          tl.play();
        })
        .on('leave', function (event) {
          const idx = parseInt(event.target.triggerElement().id.split('-')[1]);
          if (idx === 1 && event.state === 'BEFORE') {
            select('.top-cards').attr('style', 'height: 0;');
            StoryTimeline.updateActiveCard(0);
            StoryTimeline.updateGraphs(0);
          }
        })
        .addTo(controller);
      // scenes.push(scene);
    }
  });

  // embed event
  selectAll('.officer-name')
    .on('mouseover', function () {
      const officerId = this.getAttributeNode('officer-id').value;
      window._socialGraph.setHighlightNode(officerId);
    })
    .on('mouseout', function () {
      const officerId = this.getAttributeNode('officer-id').value;
      window._socialGraph.setHighlightNode(officerId, false); // unset highlight
    });

  selectAll('.complaint-id')
    .on('mouseover', function () {
      const complaintId = this.getAttributeNode('complaint-id').value;
      window._geoGraph.setHighlightNode(complaintId);
    })
    .on('mouseout', function () {
      const complaintId = this.getAttributeNode('complaint-id').value;
      window._geoGraph.setHighlightNode(complaintId, false); // unset highlight
    });
}
