'use strict';

const HOSPITAL_LAYOUT = [
  {
    ward: 'General Ward',
    rooms: [
      { room: '101', beds: ['A', 'B', 'C', 'D'] },
      { room: '102', beds: ['A', 'B', 'C', 'D'] },
    ],
  },
  {
    ward: 'ICU',
    rooms: [
      { room: 'ICU-1', beds: ['1', '2'] },
      { room: 'ICU-2', beds: ['1', '2'] },
    ],
  },
  {
    ward: 'Maternity Ward',
    rooms: [
      { room: '201', beds: ['A', 'B'] },
      { room: '202', beds: ['A', 'B'] },
    ],
  },
  {
    ward: 'Pediatric Ward',
    rooms: [
      { room: '301', beds: ['A', 'B', 'C'] },
      { room: '302', beds: ['A', 'B', 'C'] },
    ],
  },
];

module.exports = { HOSPITAL_LAYOUT };
