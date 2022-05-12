import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';
// import 'Game.js';
// var playerState


class PlayerExperience extends AbstractExperience {
  constructor(client, config, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    this.rafId = null;


    this.audioContext = new AudioContext();
    this.ambisonics = require('ambisonics');
    this.order = 3;
    this.AudioDebut = false;
    this.displayButton = "Begin";
    this.displayAngle = "Angle de tir : 0";
    this.killCount = 0;
    this.displayKills = [];
    this.lastDisplayKill = "Nobody died";

    renderInitializationScreens(client, config, $container);
  }

  async start() {
    super.start();
    this.ActiveMonsters = [];

    this.Monsters = [];
    this.Sounds = [];
    this.Sources = [];
    this.Encoders = [];
    this.BinDecoders = [];
    this.Gains = [];

    this.playerState = await this.client.stateManager.create('player');
    this.playerState.subscribe(() => this.Choice(this.playerState.getValues().Shot))

    this.globalsState = await this.client.stateManager.attach('globals', 0);
    // this.globalsState.subscribe(() => this.PopMonster(this.globalsState.getValues().CurrentMonster));

    for (let i = 1; i <= this.globalsState.getValues().NbMax; i++) {
      this.Monsters.push(await this.client.stateManager.attach('monster' + i));

      this.Sounds.push(document.createElement("audio"));
      this.Sounds[i-1].type = "audio/mpeg";
      this.Sounds[i-1].src = "Audio/Monster" + i + ".mp3";
      this.Sounds[i-1].loop = true;

      this.Sources.push(this.audioContext.createMediaElementSource(this.Sounds[i-1]));
      this.Encoders.push(new this.ambisonics.monoEncoder(this.audioContext, this.order));
      this.BinDecoders.push(new this.ambisonics.binDecoder(this.audioContext, this.order));
      this.Gains.push(this.audioContext.createGain());

      this.Gains[i-1].gain.setValueAtTime(0.3, 0);
      this.Sources[i-1].connect(this.Encoders[i-1].in);
      this.Encoders[i-1].out.connect(this.BinDecoders[i-1].in);
      this.BinDecoders[i-1].out.connect(this.Gains[i-1]);
      // this.Gains[i-1].connect(this.audioContext.destination);

      this.Monsters[i-1].subscribe(() => this.MoveMonster(i, this.globalsState.getValues().Distance, this.Monsters[i-1].getValues(), this.Encoders[i-1], this.Gains[i-1], this.playerState.getValues().ShotAngle));
    }

    if (window.DeviceOrientationEvent) {
      console.log("oui")
      window.addEventListener("deviceorientation", (e) => {
        this.playerState.set({ShotAngle: Math.round(e.alpha)});
        this.displayAngle = "Angle de tir : " + this.playerState.getValues().ShotAngle;
        this.render();
      }); 
    } 
    else {
      alert("Sorry, your browser doesn't support Device Orientation");
    }

    window.addEventListener('resize', () => this.render());
    this.render();

  }

  Choice(active) {
    if (!active) {
      return;
    }
    if (!this.AudioDebut) {
      this.displayButton = "Shot";
      this.globalsState.subscribe(() => this.PopMonster(this.globalsState.getValues().CurrentMonster));
      this.playerState.subscribe(() => this.MoveSound(this.Monsters, this.globalsState.getValues().Distance, this.Encoders[this.globalsState.getValues().CurrentMonster-1], this.Gains[this.globalsState.getValues().CurrentMonster-1], this.playerState.getValues().ShotAngle));
      this.AudioBegin();
    }
    else {
      this.KillMonster(this.playerState.getValues().ShotAngle, this.Monsters, this.globalsState.getValues().Precision)
    }
    this.playerState.set({Shot: false})
  }

  AudioBegin() {
    this.audioContext.resume();
    console.log("je suis là aussi");
    for (let i = 1; i <= this.globalsState.getValues().NbMax; i++) {
      this.Sounds[i-1].play();
    }
    this.AudioDebut = true;
    this.render();
  }

  PopMonster(Monster) {
    this.ActiveMonsters.push(Monster);
    // this.Gains[Monster-1].connect(this.audioContext.destination)
    console.log(this.globalsState.getValues())
  }

  MoveMonster(MonsterId, GlobalDistance, Monster, encoder, Gain, ShotAngle) {
    this.UpdateSoundPos(Monster, GlobalDistance, encoder, Gain, ShotAngle);
    if ((this.ActiveMonsters[this.ActiveMonsters.length-1] == MonsterId) && Monster.Distance == 10) {
      Gain.connect(this.audioContext.destination);
    }
    if (Monster.Killing) {
      this.PlayerDie(Monster.Distance, MonsterId);
    }
  }

  MoveSound(Monsters, GlobalDistance, encoder, Gain, ShotAngle) {
    for (let i = 0; i < Monsters.length; i++) {
      this.UpdateSoundPos(Monsters[i].getValues(), GlobalDistance, encoder, Gain, ShotAngle);
    }
  }

  UpdateSoundPos(Monster, GlobalDistance, encoder, Gain, ShotAngle) {
    // console.log(Monster, ShotAngle)

    encoder.azim = Monster.Position - ShotAngle;
    encoder.updateGains();
    Gain.gain.setValueAtTime((GlobalDistance - Monster.Distance)/(2*GlobalDistance), 0);
    return;
  }

  KillMonster(tir, Monsters, Precision) {
    for (let i = 0; i < this.ActiveMonsters.length; i++) {
      console.log(Monsters[this.ActiveMonsters[i] - 1].getValues().Position);
      if (Monsters[this.ActiveMonsters[i] - 1].getValues().Killing) {
        if (Math.abs((tir - Monsters[this.ActiveMonsters[i] - 1].getValues().Position)) < Precision || Math.abs((tir - Monsters[this.ActiveMonsters[i] - 1].getValues().Position)) > 360 - Precision) {
          console.log(i, this.ActiveMonsters[i]-1)
          this.killCount += 1;
          this.Gains[this.ActiveMonsters[i]-1].disconnect(this.audioContext.destination);
          this.displayKills.push(document.createElement("div"));
          console.log(Monsters)
          console.log(this.ActiveMonsters[i])
          console.log(Monsters[this.ActiveMonsters[i] - 1].getValues())
          this.displayKills[this.killCount - 1].innerHTML = "Vous avez tué un monstre en : " + Monsters[this.ActiveMonsters[i] - 1].getValues().Position;
          if (this.killCount > 1) {
            console.log(this.displayKills)
            this.displayKills[this.killCount - 1].appendChild(this.displayKills[this.killCount - 2])
          }
          this.lastDisplayKill = this.displayKills[this.killCount - 1];
          this.ActiveMonsters.splice(i)
          console.log("you kill it !")
          this.render();
        }
      }
    }
  }

  PlayerDie(Distance, MonsterId) {
    // console.log(Distance, MonsterId)
    if (Distance == 0) {
      console.log(this.ActiveMonsters)
      for (let i = 0; i < this.ActiveMonsters.length; i++) {
        if (this.ActiveMonsters[i] == MonsterId) {
          this.playerState.set({Alive: false});
          for (let j = 0; j < this.ActiveMonsters.length; j++) {
            this.Gains[this.ActiveMonsters[j]-1].disconnect(this.audioContext.destination);
          }
          this.ActiveMonsters = [];
          alert("vous êtes mort");
        }
      }
    }
  }

  render() {
    // debounce with requestAnimationFrame
    window.cancelAnimationFrame(this.rafId);

    // this.test = "garderie";
    // console.log(this.playerState)
    // console.log(this.globalsState)
    this.rafId = window.requestAnimationFrame(() => {

      render(html`
        <div style="padding: 20px">
          <h1 style="margin: 20px 0; color:blue">${this.client.type} [id: ${this.client.id}]</h1>
        </div>
        <div>
        <input type="button" id="Shot" style="width: 400px; height: 300px; font-size: 100px" value=${this.displayButton} @click="${e => this.playerState.set({Shot: true})} "/>
        </div>
        <br>
        <div>
        <input type="button" id="Shotting" value="${this.displayAngle}"/>
        </div>
        <br>
        <div>
        ${this.lastDisplayKill}
        </div>
      `, this.$container);
    });
    // console.log(this);
    // console.log(this.client);
    // console.log(this.rafId);
  }
}

export default PlayerExperience;
