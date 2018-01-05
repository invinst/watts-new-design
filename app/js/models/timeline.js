/* global data */
import { select, selectAll } from 'd3-selection';


function updateOfficersListInActiveCard(activeCardData) {
  const involvedOfficers = select('.active-card .left-col .involved-officers');
  const uids = activeCardData['UID'] || [];

  select('.active-card .left-col .num-officers').text(uids.length);
  involvedOfficers.selectAll('li').remove();
  if (uids.length > 0) {
    uids.forEach((d) => {
      const color = activeCardData['color_UID'] ? activeCardData['color_UID'][d] || 'unset' : 'unset';

      const name = data.graph.officers[d] ? data.graph.officers[d].full_name.toLowerCase() : `UnknownID-${d}`;
      const isUnknown = (color === 'unset' || color === 'rgb(0, 0, 0)');
      const element = involvedOfficers.insert('li')
        .classed('unknown', isUnknown)
        .html(`<span class='circle-icon' ${ !isUnknown && ('style="background-color:' + color + '"') }></span>`
          + ` ${name}`);
      if (data.graph.officers[d]) {
        element.classed('officer-name', true)
          .attr('officer-id', d);
      }
    });
    selectAll('.active-card .involved-officers li.unknown').raise(); // make not-found officers go to bottom
  } else {
    involvedOfficers.insert('li')
      .classed('unknown', true)
      .html('<span class="circle-icon"></span> Unknown');
  }
}

export function updateActiveCard(idx) {
  if (idx < 0 || idx >= data.timelineData.length) return;

  const activeCardData = data.timelineData[idx];
  select('.active-card .description').html(activeCardData['Content']);
  select('.active-card .date-title').text(activeCardData['Text Date']);
  select('.active-card .report-link')
    .classed('hide', !activeCardData['Documents'])
    .attr('href', activeCardData['Documents']);

  updateOfficersListInActiveCard(activeCardData);
}

export function updateGraphs(idx) {
  const currentEventData = data.timelineData[idx];

  // 1. highlight if officer nodes
  window._socialGraph.unsetHighlightNodes();
  if (currentEventData['UID']) {
    window._socialGraph.setHighlightNodes(currentEventData['UID']);
  }

  window._socialGraph.setCurrentDate(currentEventData['Date']);

  // 2. highlight complaint nodes
  const nextEventDate = ((idx + 1) < data.timelineData.length) ?
    data.timelineData[idx + 1]['Date'] : null;
  window._geoGraph.setActivePeriod(currentEventData['Date'], nextEventDate);
}

export function fixSmallHeightWindow(toggle = true) {
  if (toggle) {
    const abstractNode = select('.abstract');
    const height = window.innerHeight / 2 - 120 - abstractNode.node().clientHeight;
    if (height < 0) {
      selectAll('.active-card, .bottom-cards')
        .attr('style', `margin-top: ${-height + 20}px`);

      select('.top-cards-container')
        .attr('style', `bottom: calc(50vh + ${115 + height - 20}px)`); // change the default css
    }
  } else {
    selectAll('.top-cards-container, .active-card, .bottom-cards')
      .attr('style', '');
  }
}

export function scrollToCard(idx) {

  const cardScrollPixel = 42; // minicard-height: 30, margin: 12px
  const defaultHeightActiveCard = 235;
  const defaultPadding = 3;
  const scrollTop = (idx) * cardScrollPixel;

  // need to update content of Active Card so that Bottom card has height and margin
  updateActiveCard(idx);

  const topCard = select('.top-cards');

  // TODO: these constant numbers need to be in some files
  // 120 = half height of active-card, 140 = height to top
  const numCardShowOnTop = Math.floor((window.innerHeight / 2 - 120 - 140) / cardScrollPixel);
  const maxHeightTop = numCardShowOnTop * cardScrollPixel;

  const computedHeight = Math.max(Math.min(maxHeightTop, scrollTop), 0);

  topCard.attr('style', `height: ${computedHeight}px;`);

  if (idx >= numCardShowOnTop)
    select('.top-cards > ul')
      .attr('style', `margin-top: -${scrollTop - numCardShowOnTop * cardScrollPixel + defaultPadding}px;`);

  const pushBottomCardPixel = select('.active-card').node().scrollHeight - defaultHeightActiveCard;
  select('.active-card').attr('style', `max-height: ${(pushBottomCardPixel > 0) ? 800 : defaultHeightActiveCard}px`);

  select('.bottom-cards')
    .attr('style', `margin-top: ${pushBottomCardPixel + defaultPadding}px;`);
  select('.bottom-cards > ul').attr('style', `margin-top: ${-scrollTop - cardScrollPixel - defaultPadding}px;`);
}
