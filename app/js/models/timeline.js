/* global data */
import { select, selectAll } from 'd3-selection';


export function updateActiveCard(idx) {
  if (idx < 0 || idx >= data.timelineData.length)
    return;

  const activeCardData = data.timelineData[idx];
  select('.active-card .description').html(activeCardData['Content']);
  select('.active-card .date-title').text(activeCardData['Text Date']);
  select('.active-card .report-link')
    .classed('hide', !activeCardData['Documents'])
    .attr('href', activeCardData['Documents']);


  const involvedOfficers = select('.active-card .left-col .involved-officers');
  const uids = activeCardData['UID'] || [];

  select('.active-card .left-col .num-officers').text(uids.length);
  involvedOfficers.selectAll('li').remove();
  if (uids.length > 0) {
    uids.forEach((d) => {
      const color = activeCardData['color_UID'] ? activeCardData['color_UID'][d] || 'unset' : 'unset';
      const extraStyle = (color === 'unset') ? ' border: 1px solid #dc3747' : '';

      const name = data.graph.officers[d] ? data.graph.officers[d].full_name : `UnknownID-${d}`;
      const element = involvedOfficers.insert('li')
        .html(`<span class='circle-icon' style='background-color:${color}; ${extraStyle}'></span> ${name}`);

      if (data.graph.officers[d]) {
        element.attr('class', 'officer-name')
          .attr('officer-id', d);
      }
    });
  } else {
    involvedOfficers.insert('li')
      .html('<span class="circle-icon unknown"></span> Unknown');
  }
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

  // need to update content of Active Card so that Bottom card has height and margin
  updateActiveCard(idx);
  // update bottom margin:
  const cardScrollPixel = 42; // minicard-height: 30, margin: 12px
  const scrollTop = (idx) * 42;
  const topCard = select('.top-cards');

  // TODO: these constant numbers need to be in some files
  // TODO: so that scss and js files are able to access to same files
  // 120 = half height of active-card, 140 = height to top
  const numCardShowOnTop = Math.floor((window.innerHeight / 2 - 120 - 140) / cardScrollPixel);
  const maxHeightTop = numCardShowOnTop * cardScrollPixel;

  const computedHeight = Math.max(Math.min(maxHeightTop, scrollTop), 0);

  topCard.attr('style', `height: ${computedHeight}px;`);

  if (idx >= numCardShowOnTop)
    select('.top-cards > ul')
      .attr('style', `margin-top: -${scrollTop - numCardShowOnTop * cardScrollPixel + 3}px;`);

  const pushBottomCardPixel = select('.active-card').node().scrollHeight - 235; // 235=default height active-card
  if (pushBottomCardPixel > 0) {
    select('.active-card').attr('style', 'max-height: 800px'); // transition height
  } else {
    select('.active-card').attr('style', 'max-height: 235px;');
  }
  select('.bottom-cards')
    .attr('style', `margin-top: ${pushBottomCardPixel + 3}px;`);
  select('.bottom-cards > ul').attr('style', `margin-top: ${-scrollTop - 3}px;`);
}
