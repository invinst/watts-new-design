export const zoomLevel = 13;

export const mapCenter = {
  // 'lat': 41.816720143790924,
  'lat': 41.81006712410782,
  // 'lng': -87.52491489868162
  'lng': -87.56027714233396
};

export const customGoogleMapStyle = [
  {
    'featureType': 'administrative',
    'elementType': 'all',
    'stylers': [
      {
        'visibility': 'simplified'
      }
    ]
  },
  {
    'featureType': 'landscape',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'simplified'
      },
      {
        'color': '#fcfcfc'
      }
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'labels',
    'stylers': [
      { 'visibility': 'off' }
    ]
  },
  {
    'elementType': 'labels.text',
    'stylers': [
      {
        'visibility': 'simplified'
      }
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'off'
      },
      {
        'color': '#fcfcfc'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'off'
      },
      {
        'color': '#dddddd'
      }
    ]
  },
  {
    'featureType': 'road.arterial',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'off'
      },
      {
        'color': '#dddddd'
      }
    ]
  },
  {
    'featureType': 'road.local',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'off'
      },
      {
        'color': '#eeeeee'
      }
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [
      {
        'visibility': 'simplified'
      },
      {
        'color': '#dddddd'
      }
    ]
  }
];

export const googleKey = 'AIzaSyAo40fHRibRB9f7ofa2QDN-CBBtDTuMS0M';

export const complaintCategory = {
  '01': 'VERBAL ABUSE',
  '02': 'ALCOHOL ABUSE',
  '03': 'IMPROPER SEARCH',
  '04': 'ARREST/LOCKUP PROCEDURES',
  '05': 'EXCESSIVE FORCE',
  '06': 'BRIBERY/OFFICIAL CORRUPTION',
  '07': 'TRAFFIC',
  '08': 'CRIME MISCONDUCT',
  '09': 'CONDUCT UNBECOMING VIOLATIONS (OFF DUTY)',
  '10': 'OPERATION/PERSONNEL VIOLATIONS',
  '11': 'FIRST AMENDMENT',
  '12': 'SUPERVISORY RESPONSIBILITIES',
  '13': '',
  '14': 'DOMESTIC',
  '15': 'DRUGS/SUBSTANCE ABUSE',
  '16': 'SEARCH WARRANTS',
  '17': 'MEDICAL INTEGRITY',
  '18': 'FIREARM DISCHARGE WITH HITS',
  '19': 'COERCION',
  '20': 'NOTIFICATIONS'
};

export const specialOfficers = [
  30215, 19331, 13777, 2334, 10361, 20481, 31456, 26902, 15883, 16181, 23933, 27871, 11824
];
