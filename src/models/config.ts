export let Config = {
  name:      'leetcode',
  version:   '2.0.0',

  dbkeys:    {},
  algos:     ['Random', 'Sequential'],
  companies: ['Apple', 'Amazon', 'Facebook', 'Google', 'Microsoft'],
  levels:    ['Easy', 'Medium', 'Hard'],
  tags:      ['Resolved', 'Later', 'Favorite'],
  workers:   ['1', '2', '4', '8', '16'],

  // all questions
  questions: {
    All:      0,
    Resolved: 0,
    Later:    0,
    Favorite: 0,
    dirty:    true // ture means need refreshing count
  },

  // filtered questions
  filtered: {
    filter:   null, // current filter applied
    ids:      [],   // ids of all filtered questions
    idx:      -1,   // current selected question index
    question: null  // current selected question
  },

  // updated questions
  updated: {
    updating:  false,
    wifiOnly:  true,  // if true, only updaing in wifi mode.
    fully:     false, // if true, do a full crawl on all question pages
    workers:   '1',   // how many workers to crawl questions
    questions: 0,     // how many questions processed
    pages:     0,     // how many pages processed
    new:       0,     // how many new questions found
  },

  filter: {
    algo:    'Random', // selection algo
    status:  '0',      // by status, 0=new, 1=resolved
    tag:     '',       // by tag
    company: '',       // by company
    level:   'All',    // by level
  }
}
