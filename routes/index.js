let express = require('express');

let fs = require('fs');
let d3 = require('d3');
let _ = require('lodash');

let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  renderTimelineStory(res, 'story-page');
});

router.get('/collapse', function (req, res, next) {
  renderTimelineStory(res, 'story-collapse-page');
});

function renderTimelineStory(res, pageId) {

  let colorFunction = d3.scaleLinear()
    .domain([0, 40])
    .range(['#F3C2C2', '#FF4F5D', '#FF0006', '#D40003', '#B10002']);

  fs.readFile('data/officer_graph_by_jamie_without_partition.json', 'utf8', function (err, text) {
    if (err) throw err;

    const jsonObject = JSON.parse(text);
    fs.readFile('data/Watts_data_story.tsv', 'utf8', function (err, text) {
      let tsvData = d3.tsvParse(text);
      let timelineData = tsvData.map(function (d) {
        let res = _.pick(d, ['Text Date', 'Date', 'cr_id', 'complaint_date',
          'incident_date', 'complaint_category', 'lng', 'lat', 'Content', 'Documents']);
        if (d['UID']) {
          res['UID'] = d['UID'].split('; ');
          const dates = Object.keys(jsonObject.graph.updating_by_date.officer_complaints).sort();

          // calculate the color of node
          const recentDate = _.findLast(dates,
            (d) => (d <= res['complaint_date']));
          if (recentDate) {
            res['color_UID'] = _.reduce(res['UID'], function (acc, n) {
              acc[n] = colorFunction(jsonObject.graph.updating_by_date.officer_complaints[recentDate][n]);
              return acc;
            }, {});
          }
        }
        return res;
      });

      // timelineData['officerData'] = officerData;
      const strJson = JSON.stringify(
        Object.assign({},
          jsonObject,
          {
            timelineData: timelineData,
            numScene: tsvData.length
          }),
        null, 0
      );
      console.warn(pageId);
      res.render('story', {
        title: 'Officer unit 715',
        pageId: pageId,
        data: strJson,
        timelineData: timelineData,
        officerData: jsonObject.graph.officers
      });
    });
  });
}


module.exports = router;
