import { AbstractExperience } from '@soundworks/core/server';

class PlayerExperience extends AbstractExperience {
  constructor(server, clientTypes, options = {}) {
    super(server, clientTypes);
    this.monsters = [];

////////////////////////////////////////////
// Pour jouer plus tard (ls /dev/tty.* pour avoir la liste des serial port si jamais problème)
////////////////////////////////////////////


    // var serialport = require("serialport");
    // var SerialPort = serialport.SerialPort;
    // var sp = new SerialPort({ path:"/dev/tty.usbserial-10", baudRate: 115200});

    // sp.on("open", function() {
    // console.log('open');
    // sp.on('data', function(data) {
    // console.log('data received: ' + data);
    // });
    // });


  }

  async start() {
    super.start();

    this.globalsState = await this.server.stateManager.attach('globals', 0);
    // console.log(this.server.stateManager)
    setInterval(() => this.NewMonster(this.monsters, this.globalsState, this.globalsState.getValues()), this.globalsState.getValues().Time);
    for (let i = 1; i <= this.globalsState.getValues().NbMax; i++) {
      this.monsters.push(await this.server.stateManager.create('monster' + i, {Id: i}));
      // console.log(this.globalsState.getValues().Velocity)
      setInterval(() => this.MonsterMove(this.globalsState, this.globalsState.getValues().Velocity, this.monsters[i-1], this.monsters[i-1].getValues()), this.globalsState.getValues().Speed);
    }
  }

  NewMonster(Monster, Global, Values) {
    if (Values.CurrentMonster < Values.NbMax) {
      Global.set({CurrentMonster: Values.CurrentMonster + 1})
    }
    else {
      Global.set({CurrentMonster: 1})
    }
    Monster[Global.getValues().CurrentMonster - 1].set({Activity: true});
    console.log(Values)
    console.log(Global.getValues().CurrentMonster)
  }

  MonsterMove(Global, Move, Monster, Values) {
    if (Values.Activity) {
      if (Values.Distance != 0)
      // console.log(Move)
      // console.log(Math.random()*(2*Move + 1) - Move)
      Monster.set({Distance: Values.Distance - 1, Position: (Values.Position + Math.floor(Math.random()*(2*Move + 1)) - Move + 360)%360});
      else {
        Monster.set({Distance: Global.getValues().Distance, Position: Math.floor(Math.random()*361), Killing: true});
      }
    }
    if (Monster.getValues().Distance == 0) {
      Monster.set({Activity: false, Position: 0, Killing: false})
    }
    console.log(Monster.getValues())
  }

  enter(client) {
    super.enter(client);
  }

  exit(client) {
    super.exit(client);
  }
}

export default PlayerExperience;
