export default {

  Id: {
  	type: 'integer',
  	min: 1,
  	step: 1,
  	default: 1,
  },

  Position: {
    type: 'integer',
    min: 0,
    max: 360,
    step: 1,
    default: 0,
  },

  Distance: {
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    default: 0,
  },

  Activity: {
  	type: 'boolean',
  	default: false,
  },
  
  Killing: {
  	type: 'boolean',
  	default: false,
  },
};