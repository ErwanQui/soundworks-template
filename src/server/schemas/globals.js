// import parameters from '@ircam/parameters'

export default {
  number: {
    type: 'integer',
    min: 0,
    max: 5,
    step: 1,
    default: 4,
  },

  // Logger: {
  // 	console.log("er")
  // },

  Time: {
    type: 'integer',
    min: 0,
    max: 100000,
    step: 1,
    default: 8000,
  },

  Distance: {
    type: 'integer',
    min: 0,
    max: 50,
    step: 1,
    default: 10,
  },

  Speed: {
    type: 'float',
    min: 0,
    max: 10000,
    step: 1,
    default: 2000,
  },

  NbMax: {
  	type: 'integer',
  	max: 5,
  	default: 1,
  },

  CurrentMonster: {
  	type: 'integer',
  	min: 1,
  	max: 10,
  	step: 1,
  	default: 0,
  },

  Velocity: {
  	type: 'integer',
  	min: 0,
  	max: 180,
  	step: 1,
  	default: 45,
  },

  Precision: {
  	type: 'integer',
  	min: 0,
  	max: 180,
  	step: 1,
  	default: 20,
  },
};

// const definitions = {
//   myBooleanParam: {
//     type: 'boolean',
//     default: false,
//     constant: false,
//     metas: { kind: 'static' }
//   },
//   myIntegerParam: {
//     type: 'integer',
//     min: 0,
//     max: Infinity,
//     default: 0,
//     constant: false,
//     metas: {
//       kind: 'static',
//       shortDescr: 'My First Integer Param',
//       fullDescr: 'This parameter is my first integer parameter in this example.',
//       unit: '%',
//       step: 1,
//       max: 100,
//     }
//   },
//   // ...
// };

// class MyClass {
//   constructor(options) {
//     this.params = parameters(definitions, options);

//     this.params.addListener((name, value, metas) => {
//       // ...
//     });

//     this.params.addParamListener('myIntegerParam', (value, metas) => {
//       // ...
//     });
//   }
// }

// const myInstance = new MyClass({ myIntegerParam: 42 });

// const bValue = myInstance.params.get('myBooleanParam');
// > false

// const iValue = myInstance.params.get('myIntegerParam');
// > 42

// myInstance.params.set('myIntegerParam', definitions.myIntegerParam.min - 1)