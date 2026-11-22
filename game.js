/* THE LAST REBOUND — playable prototype foundation
 * Phaser 3 / JavaScript.  Controls: WASD, Shift, F, E, Esc.
 */
(() => {
  const W = 1280, H = 720;
  const COLORS = { ink:0x080a12, floor:0x252631, tile:0x30313d, purple:0x713b91, blue:0x244a76, orange:0xa95a35, warm:0xe7a56c };
  let game;

  class BootScene extends Phaser.Scene {
    constructor(){ super('Boot'); }
    preload(){ this.load.image('title-art','assets/title-art.png'); }
    create(){
      const load=document.getElementById('loading'); if(load){load.style.opacity='0';setTimeout(()=>load.remove(),750);}
      this.scene.start('Title');
    }
  }

  class TitleScene extends Phaser.Scene {
    constructor(){ super('Title'); }
    create(){
      const bg=this.add.image(W/2,H/2,'title-art').setDisplaySize(W,H);
      bg.setTint(0xb9b0d0);
      this.add.rectangle(W/2,H/2,W,H,0x050610,.28);
      this.add.rectangle(0,0,500,H,0x050610,.45).setOrigin(0);
      this.add.text(76,105,'A HORIZON TRAMPOLINE PARK STORY',{fontFamily:'DM Mono',fontSize:'12px',color:'#c69ae7',letterSpacing:3});
      this.add.text(70,145,'THE LAST\nREBOUND',{fontFamily:'Manrope',fontSize:'76px',fontStyle:'800',color:'#f1edf5',lineSpacing:-10,shadow:{offsetX:0,offsetY:5,color:'#000000',blur:18,fill:true}});
      this.add.text(78,350,'SOME MEMORIES DON’T STAY BURIED.',{fontFamily:'DM Mono',fontSize:'13px',color:'#b6afc4',letterSpacing:2});
      const start=this.add.text(80,435,'[ BEGIN NIGHT SHIFT ]',{fontFamily:'DM Mono',fontSize:'17px',color:'#f3d8ff',backgroundColor:'#43245b',padding:{x:18,y:14}}).setInteractive({useHandCursor:true});
      start.on('pointerover',()=>start.setStyle({backgroundColor:'#75439a',color:'#fff'}));
      start.on('pointerout',()=>start.setStyle({backgroundColor:'#43245b',color:'#f3d8ff'}));
      start.on('pointerdown',()=>this.scene.start('Game'));
      this.add.text(80,500,'WASD  MOVE     SHIFT  RUN     F  FLASHLIGHT\nE  INTERACT     ESC  PAUSE',{fontFamily:'DM Mono',fontSize:'11px',color:'#898594',lineSpacing:9});
      this.add.text(W-28,H-24,'PROTOTYPE BUILD  //  CHAPTER 01',{fontFamily:'DM Mono',fontSize:'10px',color:'#656171'}).setOrigin(1,1);
      this.tweens.add({targets:start,alpha:.65,duration:900,yoyo:true,repeat:-1});
    }
  }

  class GameScene extends Phaser.Scene {
    constructor(){ super('Game'); this.timeline='present'; this.pastTime=24; this.switches=0; this.memories=0; this.paused=false; this.flashOn=true; this.messageTimer=0; this.enemyAwake=false; }
    create(){
      this.physics.world.setBounds(0,0,2200,1500);
      this.drawWorld();
      this.createPlayer();
      this.createObjects();
      this.createLighting();
      this.createHUD();
      this.cameras.main.setBounds(0,0,2200,1500).startFollow(this.player,true,.08,.08).setZoom(1.05);
      this.cameras.main.fadeIn(900,0,0,0);
      this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,F,E,ESC');
      this.input.keyboard.on('keydown-ESC',()=>this.togglePause());
      this.showMessage('The doors locked behind you. Find something that remembers this place.');
      this.time.delayedCall(1800,()=>this.showMessage('A trampoline can still take you back. Don’t stay too long.'));
      this.events.on('shutdown',()=>{this.input.keyboard.removeAllListeners();});
    }

    drawWorld(){
      const g=this.add.graphics();
      // Concrete base with subtle tiled grid.
      g.fillGradientStyle(0x20212b,0x20212b,0x171923,0x171923,1); g.fillRect(0,0,2200,1500);
      for(let y=0;y<1500;y+=92){for(let x=0;x<2200;x+=92){g.fillStyle(((x/92+y/92)%2===0)?0x292a35:0x22232d,.65);g.fillRoundedRect(x+3,y+3,86,86,4);g.lineStyle(1,0x77717f,.10);g.strokeRect(x+3,y+3,86,86);}}
      // Scuffed patches / puddles.
      for(let i=0;i<85;i++){let x=Phaser.Math.Between(35,2160),y=Phaser.Math.Between(35,1460);g.fillStyle(i%3?0x0d111d:0x66536f,Phaser.Math.FloatBetween(.025,.11));g.fillEllipse(x,y,Phaser.Math.Between(12,70),Phaser.Math.Between(5,24));}
      // Outer walls and structural dividers.
      const wall=(x,y,w,h,c=0x11131e)=>{g.fillStyle(c,1);g.fillRoundedRect(x,y,w,h,7);g.lineStyle(5,0x56505f,.55);g.strokeRoundedRect(x,y,w,h,7);g.lineStyle(2,0x090b12,.9);g.strokeRect(x+8,y+8,w-16,h-16);};
      wall(0,0,2200,38);wall(0,0,38,1500);wall(2162,0,38,1500);wall(0,1462,2200,38);
      wall(38,390,430,22);wall(520,390,480,22);wall(1120,390,470,22);wall(1710,390,452,22);
      wall(520,40,22,350);wall(1000,40,22,350);wall(1590,40,22,350);
      wall(38,1050,520,22);wall(700,1050,520,22);wall(1360,1050,802,22);
      // Lobby / reception desk.
      g.fillStyle(0x40303a,1);g.fillRoundedRect(110,100,300,145,12);g.fillStyle(0x806078,.8);g.fillRoundedRect(125,112,270,23,6);g.fillStyle(0x11121b,1);g.fillRoundedRect(150,155,220,70,7);
      g.fillStyle(0xd78bce,.65);g.fillRect(160,163,200,3);g.fillStyle(0x8e7094,.4);g.fillRect(160,180,200,2);
      this.add.text(150,80,'RECEPTION',{fontFamily:'DM Mono',fontSize:'15px',color:'#c8a5d4',letterSpacing:3});
      // Main trampoline grid: padded rails and dark elastic centers.
      const tramp=(x,y,w=180,h=145)=>{
        g.fillStyle(0x090c15,1);g.fillRoundedRect(x+8,y+10,w,h,9);
        g.fillStyle(0x24446d,1);g.fillRoundedRect(x,y,w,h,11);
        g.lineStyle(4,0x8a55a8,.9);g.strokeRoundedRect(x+7,y+7,w-14,h-14,8);
        g.fillStyle(0x111c2a,1);g.fillRoundedRect(x+17,y+17,w-34,h-34,5);
        g.lineStyle(1,0x6a81a0,.35);for(let i=1;i<5;i++){g.lineBetween(x+17+i*(w-34)/5,y+17,x+17+i*(w-34)/5,y+h-17);g.lineBetween(x+17,y+17+i*(h-34)/5,x+w-17,y+17+i*(h-34)/5);}
        g.fillStyle(0x9c6db4,.8);for(let i=0;i<8;i++){g.fillCircle(x+14+i*(w-28)/7,y+8,2);g.fillCircle(x+14+i*(w-28)/7,y+h-8,2);}
      };
      [[600,95],[800,95],[600,260],[800,260],[1190,95],[1390,95],[1190,260],[1390,260],[1760,530],[1960,530],[1760,700],[1960,700],[650,1160],[850,1160],[1050,1160]].forEach(p=>tramp(...p));
      // Foam pit.
      g.fillStyle(0x9b593b,1);g.fillRoundedRect(80,500,390,430,18);g.lineStyle(12,0x42628c,1);g.strokeRoundedRect(86,506,378,418,13);g.fillStyle(0x101b2c,1);g.fillRoundedRect(105,525,340,380,10);
      for(let i=0;i<145;i++){let x=Phaser.Math.Between(115,430),y=Phaser.Math.Between(535,895),s=Phaser.Math.Between(12,24);g.fillStyle([0x263d64,0x563d70,0x9b533d,0x31577a,0x55475f][i%5],.9);g.fillRoundedRect(x,y,s,s,3);g.lineStyle(1,0xc0a5bd,.18);g.strokeRoundedRect(x,y,s,s,3);}
      this.add.text(100,465,'FOAM PIT',{fontFamily:'DM Mono',fontSize:'13px',color:'#c7a5b9',letterSpacing:2});
      // Party room and props.
      g.fillStyle(0x302d3b,1);g.fillRoundedRect(1130,470,420,280,12);g.lineStyle(3,0x8e7094,.7);g.strokeRoundedRect(1130,470,420,280,12);
      g.fillStyle(0x6b4b62,1);g.fillRoundedRect(1200,555,280,95,9);g.fillStyle(0x171a25,1);g.fillRoundedRect(1210,565,260,75,5);
      for(let i=0;i<4;i++){g.fillStyle(0x9a6b80,.85);g.fillCircle(1170+i*95,510,13);}
      this.add.text(1160,485,'PARTY ROOM 03',{fontFamily:'DM Mono',fontSize:'12px',color:'#cba7c8'});
      // Utility corridor / exit zone.
      wall(1750,880,22,170);g.fillStyle(0x5a1825,1);g.fillRoundedRect(1850,1120,220,90,8);g.fillStyle(0xf05d68,.9);g.fillRect(1880,1132,160,5);this.add.text(1885,1145,'EXIT',{fontFamily:'DM Mono',fontSize:'24px',color:'#ff8791'});
      // Decorative benches, plant pots, fallen signs.
      const bench=(x,y)=>{g.fillStyle(0x11151e,1);g.fillRoundedRect(x,y,100,25,5);g.fillStyle(0x65516b,1);g.fillRoundedRect(x+5,y+4,90,8,3);g.fillRect(x+12,y+22,5,15);g.fillRect(x+82,y+22,5,15);};
      bench(115,280);bench(1520,850);bench(400,1200);
      for(const [x,y] of [[470,190],[1650,190],[1070,870]]){g.fillStyle(0x282a31,1);g.fillRoundedRect(x,y,48,48,6);g.fillStyle(0x37513f,1);g.fillEllipse(x+24,y-7,48,54);g.fillStyle(0x5b7850,.8);g.fillEllipse(x+14,y-19,22,36);}
      // Signs and ambient lamps.
      this.add.text(620,35,'JUMPZONE  /  MAIN ARENA',{fontFamily:'Manrope',fontSize:'24px',fontStyle:'800',color:'#a7a1b5'}).setAlpha(.7);
      for(const [x,y] of [[560,55],[1090,55],[1650,55],[550,990],[1600,990]]){g.fillStyle(0x9d68d0,.12);g.fillCircle(x,y,58);g.fillStyle(0xd8b3f3,.6);g.fillCircle(x,y,5);}
      // Past-only memory glow locations marked subtly.
      this.add.circle(710,330,24,0xf2c78b,.07).setDepth(2);
      this.worldDecor=g;
      // Static collision blocks. Door gaps are intentional.
      this.walls=this.physics.add.staticGroup();
      const addWall=(x,y,w,h)=>{let r=this.add.rectangle(x+w/2,y+h/2,w,h,0x000000,0);this.physics.add.existing(r,true);r.body.setSize(w,h);this.walls.add(r);};
      [[0,0,2200,38],[0,0,38,1500],[2162,0,38,1500],[0,1462,2200,38],[38,390,430,22],[520,390,480,22],[1120,390,470,22],[1710,390,452,22],[520,40,22,350],[1000,40,22,350],[1590,40,22,350],[38,1050,520,22],[700,1050,520,22],[1360,1050,802,22],[1750,880,22,170]].forEach(a=>addWall(...a));
    }

    createPlayer(){
      const tex=this.make.graphics({x:0,y:0,add:false});
      tex.fillStyle(0x05070d,.55);tex.fillEllipse(25,48,35,13);
      tex.fillStyle(0x202431,1);tex.fillRoundedRect(12,20,26,26,8);
      tex.fillStyle(0x313849,1);tex.fillCircle(25,15,12);
      tex.fillStyle(0x111722,1);tex.fillCircle(25,13,12);
      tex.fillStyle(0xc7a7a0,1);tex.fillCircle(25,17,7);
      tex.fillStyle(0xe0c2a0,1);tex.fillCircle(25,5,8);
      tex.fillStyle(0x8b6d9d,1);tex.fillRoundedRect(15,26,20,17,5);
      tex.fillStyle(0xb8a4c9,1);tex.fillRect(18,28,14,3);
      tex.generateTexture('player-art',50,55);tex.destroy();
      this.player=this.physics.add.sprite(270,760,'player-art').setDepth(20).setScale(1.08);
      this.player.setCollideWorldBounds(true);this.player.body.setSize(24,28).setOffset(13,20);this.physics.add.collider(this.player,this.walls);
      this.playerSpeed=190;
      this.playerShadow=this.add.ellipse(270,786,38,15,0x000000,.42).setDepth(19);
    }

    createObjects(){
      this.trampolines=[{x:690,y:165,r:88},{x:890,y:165,r:88},{x:690,y:330,r:88},{x:890,y:330,r:88},{x:1280,y:165,r:88},{x:1480,y:165,r:88},{x:1280,y:330,r:88},{x:1480,y:330,r:88},{x:1850,y:600,r:88},{x:2050,y:600,r:88},{x:1850,y:770,r:88},{x:2050,y:770,r:88},{x:740,y:1230,r:88},{x:940,y:1230,r:88},{x:1140,y:1230,r:88}];
      this.memoryItems=[
        {x:1180,y:820,name:'A birthday photograph',detail:'You, your brother, and a cake with too many candles.'},
        {x:400,y:970,name:'A tiny red wristband',detail:'Your brother tied it around your wrist. He said it meant you were a team.'},
        {x:1500,y:850,name:'A stuffed rabbit',detail:'One ear is torn. You remember carrying it everywhere.'}
      ];
      this.memorySprites=[];
      this.memoryItems.forEach((m,i)=>{
        const c=this.add.container(m.x,m.y).setDepth(10);
        const glow=this.add.circle(0,0,30,0xe8b7ff,.09);const ring=this.add.circle(0,0,14,0x000000,0).setStrokeStyle(2,0xd4a4ed,.8);
        const icon=this.add.text(0,0,['▧','◈','♧'][i],{fontFamily:'Manrope',fontSize:'24px',color:'#f1caff'}).setOrigin(.5);
        c.add([glow,ring,icon]);this.tweens.add({targets:glow,alpha:.02,scale:1.5,duration:1200,repeat:-1,yoyo:true});m.sprite=c;this.memorySprites.push(m);
      });
      this.exitZone=this.add.zone(1960,1270,170,120);this.physics.world.enable(this.exitZone);this.exitZone.body.setAllowGravity(false);this.exitZone.body.setImmovable(true);
      this.exitGlow=this.add.circle(1960,1170,36,0xe54c61,.08).setDepth(3);
      this.copy=this.add.container(1780,170).setDepth(18).setAlpha(0);
      const shadow=this.add.ellipse(0,22,36,12,0x000000,.8);const body=this.add.ellipse(0,0,25,38,0x03040a,1);const head=this.add.circle(0,-21,13,0x03040a,1);const eyes=this.add.text(0,-23,'··',{fontFamily:'Manrope',fontSize:'28px',color:'#e6c7ff'}).setOrigin(.5);
      this.copy.add([shadow,body,head,eyes]);this.copyEyes=eyes;
      this.enemy=this.physics.add.existing(this.add.zone(1780,170,30,40));this.enemy.body.setAllowGravity(false);this.enemy.body.setSize(28,34);this.enemy.body.setImmovable(true);this.enemyActive=false;
    }

    createLighting(){
      // Soft radial vignette and flashlight halo are separate from the art so the player can move through the light.
      const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');
      const grad=ctx.createRadialGradient(256,256,25,256,256,255);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(.34,'rgba(0,0,0,.04)');grad.addColorStop(.62,'rgba(0,0,0,.50)');grad.addColorStop(1,'rgba(0,0,0,.96)');ctx.fillStyle=grad;ctx.fillRect(0,0,512,512);
      const tex=this.textures.createCanvas('darkness',512,512);tex.context.drawImage(c,0,0);tex.refresh();
      this.darkness=this.add.image(W/2,H/2,'darkness').setScrollFactor(0).setDepth(80).setDisplaySize(W*1.6,H*1.6).setAlpha(.82);
      const halo=document.createElement('canvas');halo.width=512;halo.height=512;const hctx=halo.getContext('2d');const hg=hctx.createRadialGradient(256,256,5,256,256,250);hg.addColorStop(0,'rgba(255,225,177,.27)');hg.addColorStop(.18,'rgba(255,220,170,.15)');hg.addColorStop(.45,'rgba(255,215,165,.035)');hg.addColorStop(1,'rgba(255,215,165,0)');hctx.fillStyle=hg;hctx.fillRect(0,0,512,512);
      const ht=this.textures.createCanvas('flash-halo',512,512);ht.context.drawImage(halo,0,0);ht.refresh();
      this.flashHalo=this.add.image(W/2,H/2,'flash-halo').setScrollFactor(0).setDepth(81).setDisplaySize(540,540);
      this.add.rectangle(W/2,H/2,W,H,0x070813,.12).setScrollFactor(0).setDepth(79);
    }

    createHUD(){
      this.hud=this.add.container(0,0).setScrollFactor(0).setDepth(100);
      const panel=(x,y,w,h)=>this.add.rectangle(x,y,w,h,0x080912,.78).setOrigin(0).setStrokeStyle(1,0x8b719b,.45);
      this.hud.add(panel(24,22,340,76));
      this.hud.add(this.add.text(43,34,'CURRENT OBJECTIVE',{fontFamily:'DM Mono',fontSize:'10px',color:'#c79be4',letterSpacing:2}));
      this.objectiveText=this.add.text(43,54,'Find 3 things that remind you of home.',{fontFamily:'Manrope',fontSize:'14px',color:'#eee8f3'});this.hud.add(this.objectiveText);
      this.hud.add(panel(W-270,22,246,76));
      this.timelineText=this.add.text(W-248,34,'PRESENT',{fontFamily:'DM Mono',fontSize:'12px',color:'#d8b4f1',letterSpacing:3});this.hud.add(this.timelineText);
      this.timerText=this.add.text(W-248,57,'THE PARK IS QUIET',{fontFamily:'DM Mono',fontSize:'11px',color:'#aaa3b7'});this.hud.add(this.timerText);
      this.hud.add(panel(24,H-82,245,58));
      this.hud.add(this.add.text(42,H-69,'FLASHLIGHT  [F]',{fontFamily:'DM Mono',fontSize:'10px',color:'#b7afc3',letterSpacing:2}));
      this.battery=this.add.graphics();this.hud.add(this.battery);
      this.prompt=this.add.text(W/2,H-58,'',{fontFamily:'DM Mono',fontSize:'13px',color:'#f0d8ff',backgroundColor:'#21162d',padding:{x:14,y:9}}).setOrigin(.5);this.hud.add(this.prompt);
      this.message=this.add.text(W/2,112,'',{fontFamily:'Manrope',fontSize:'16px',fontStyle:'600',color:'#f4eaf8',align:'center',backgroundColor:'#090812cc',padding:{x:18,y:12},wordWrap:{width:620}}).setOrigin(.5).setAlpha(0);this.hud.add(this.message);
      this.memoryCount=this.add.text(W-250,H-54,'MEMORIES  0 / 3',{fontFamily:'DM Mono',fontSize:'11px',color:'#b8a4c8'});this.hud.add(this.memoryCount);
      this.pauseOverlay=this.add.container(0,0).setDepth(150).setScrollFactor(0).setVisible(false);
      this.pauseOverlay.add(this.add.rectangle(W/2,H/2,W,H,0x03040a,.82));this.pauseOverlay.add(this.add.text(W/2,H/2-35,'PAUSED',{fontFamily:'Manrope',fontSize:'44px',fontStyle:'800',color:'#f1e9f6'}).setOrigin(.5));this.pauseOverlay.add(this.add.text(W/2,H/2+28,'Press ESC to return',{fontFamily:'DM Mono',fontSize:'13px',color:'#b8a9c4'}).setOrigin(.5));
      this.batteryBars=5;
    }

    showMessage(text){this.message.setText(text).setAlpha(1);this.tweens.killTweensOf(this.message);this.tweens.add({targets:this.message,alpha:0,delay:2600,duration:700});}
    togglePause(){if(!this.player)return;this.paused=!this.paused;this.physics.world.isPaused=this.paused;this.pauseOverlay.setVisible(this.paused);if(this.paused){this.scene.pause();this.scene.launch('Pause');}}

    update(time,delta){
      if(this.scene.isPaused())return;
      const dt=Math.min(delta/1000,.04);
      let vx=0,vy=0;const k=this.keys;
      if(k.A.isDown||k.LEFT.isDown)vx--;if(k.D.isDown||k.RIGHT.isDown)vx++;if(k.W.isDown||k.UP.isDown)vy--;if(k.S.isDown||k.DOWN.isDown)vy++;
      const moving=!!(vx||vy);if(moving){const len=Math.hypot(vx,vy);vx/=len;vy/=len;}
      const sprint=k.SHIFT.isDown?1.42:1;this.player.body.setVelocity(vx*this.playerSpeed*sprint,vy*this.playerSpeed*sprint);
      this.playerShadow.setPosition(this.player.x,this.player.y+24);
      this.player.setFlipX(vx<-.1);
      this.player.rotation=moving?Math.sin(time*.012)*.035:0;
      this.flashHalo.setPosition(W/2+(this.player.x-this.cameras.main.scrollX-W/2)*.12,H/2+(this.player.y-this.cameras.main.scrollY-H/2)*.12);
      this.darkness.setAlpha(this.flashOn?.84:1);
      this.flashHalo.setAlpha(this.flashOn?1:0);
      if(Phaser.Input.Keyboard.JustDown(k.F)){this.flashOn=!this.flashOn;this.showMessage(this.flashOn?'Flashlight on.':'Flashlight off.');}
      this.checkNearby();
      if(Phaser.Input.Keyboard.JustDown(k.E))this.interact();
      if(this.timeline==='past'){
        this.pastTime-=dt;if(this.pastTime<=0)this.returnToPresent(true);
        this.timerText.setText(`MEMORY FADING  ${Math.ceil(this.pastTime)}s`);
      }
      if(this.enemyActive){
        const dx=this.player.x-this.enemy.x,dy=this.player.y-this.enemy.y,d=Math.hypot(dx,dy)||1;
        const speed=52+this.switches*13;this.enemy.body.setVelocity(dx/d*speed,dy/d*speed);this.copy.setPosition(this.enemy.x,this.enemy.y);
        this.copy.setAlpha(.72+Math.sin(time*.009)*.2);
        if(d<32){this.gameOver('IT CAUGHT UP WITH YOU.');}
      }
      this.battery.clear();for(let i=0;i<5;i++){this.battery.fillStyle(i<this.batteryBars?0xd7c5e7:0x393342,1);this.battery.fillRoundedRect(43+i*27,H-43,20,12,2);}
      if(this.timeline==='present')this.timerText.setText(this.enemyActive?'SOMETHING IS FOLLOWING YOU':'THE PARK IS QUIET');
      this.memoryCount.setText(`MEMORIES  ${this.memories} / 3`);
      if(this.memories===3)this.objectiveText.setText('Reach the EXIT at the far end of the park.');
    }

    checkNearby(){
      let prompt='';this.nearTrampoline=null;this.nearMemory=null;this.nearExit=false;
      if(this.timeline==='present'||this.timeline==='past'){
        for(const t of this.trampolines){if(Phaser.Math.Distance.Between(this.player.x,this.player.y,t.x,t.y)<t.r){this.nearTrampoline=t;prompt='[ E ]  BOUNCE  —  SHIFT TIMELINE';break;}}
      }
      if(!this.nearTrampoline){for(const m of this.memoryItems){if(!m.found&&Phaser.Math.Distance.Between(this.player.x,this.player.y,m.x,m.y)<54){this.nearMemory=m;prompt='[ E ]  REMEMBER';break;}}}
      if(this.memories===3&&Phaser.Math.Distance.Between(this.player.x,this.player.y,1960,1270)<115){this.nearExit=true;prompt='[ E ]  OPEN THE EXIT';}
      this.prompt.setText(prompt).setAlpha(prompt?1:0);
    }

    interact(){
      if(this.nearTrampoline){if(this.timeline==='present')this.enterPast();else this.returnToPresent(false);return;}
      if(this.nearMemory){const m=this.nearMemory;m.found=true;m.sprite.setVisible(false);this.memories++;this.showMessage(`${m.name}\n${m.detail}`);if(this.memories===3)this.showMessage('You remember everything. The exit is open. But something remembers you, too.');return;}
      if(this.nearExit&&this.memories===3){this.finishGame();}
    }

    enterPast(){
      this.timeline='past';this.switches++;this.pastTime=24;this.cameras.main.flash(450,244,197,255);
      this.timelineText.setText('PAST  /  MEMORY').setColor('#f4c98d');this.timerText.setText('MEMORY FADING  24s');
      this.cameras.main.setBackgroundColor('#34263b');this.worldDecor.setAlpha(.58);
      this.player.setTint(0xffdfb7);this.showMessage('The air is warm. Somewhere, your brother is laughing.');
      this.memoryItems.forEach(m=>{if(!m.found)m.sprite.setAlpha(1);});
      this.trampolines.forEach(t=>{this.add.circle(t.x,t.y,68,0xf2c68c,.045).setDepth(3);});
      if(this.switches>=2){this.showMessage('You weren’t supposed to remember this much.');}
    }
    returnToPresent(expired){
      if(this.timeline!=='past')return;this.timeline='present';this.cameras.main.flash(500,130,80,160);this.timelineText.setText('PRESENT').setColor('#d8b4f1');this.cameras.main.setBackgroundColor('#080a12');this.worldDecor.setAlpha(1);this.player.clearTint();
      this.switches++;this.pastTime=24;
      if(this.switches>=2&&!this.enemyActive){this.enemyActive=true;this.enemy.setPosition(1780,170);this.copy.setPosition(1780,170).setAlpha(1);this.showMessage('You hear your own footsteps. They are not coming from you.');}
      else if(this.enemyActive){this.enemy.setPosition(Phaser.Math.Clamp(this.enemy.x+Phaser.Math.Between(-170,170),120,2100),Phaser.Math.Clamp(this.enemy.y+Phaser.Math.Between(-170,170),100,1400));this.showMessage('It is closer now.');}
      else this.showMessage(expired?'The memory spit you out.':'The present feels colder.');
    }

    finishGame(){
      this.physics.world.pause();this.cameras.main.fadeOut(1200,0,0,0);
      this.time.delayedCall(1250,()=>{
        this.add.rectangle(this.cameras.main.scrollX+W/2,this.cameras.main.scrollY+H/2,W,H,0x05050a,.96).setScrollFactor(0).setDepth(200);
        this.add.text(W/2,H/2-80,'THE DOOR OPENS.',{fontFamily:'Manrope',fontSize:'42px',fontStyle:'800',color:'#f1e9f6'}).setOrigin(.5).setScrollFactor(0).setDepth(201);
        this.add.text(W/2,H/2+2,'But from somewhere behind you, a child whispers:\n“Wait. You forgot me again.”',{fontFamily:'Manrope',fontSize:'17px',color:'#c7b9d2',align:'center',lineSpacing:10}).setOrigin(.5).setScrollFactor(0).setDepth(201);
        const again=this.add.text(W/2,H/2+110,'[ RETURN TO TITLE ]',{fontFamily:'DM Mono',fontSize:'13px',color:'#e5c3fa',backgroundColor:'#342044',padding:{x:15,y:12}}).setOrigin(.5).setScrollFactor(0).setDepth(202).setInteractive();again.on('pointerdown',()=>this.scene.start('Title'));
      });
    }
    gameOver(line){
      if(this.isOver)return;this.isOver=true;this.physics.world.pause();this.cameras.main.shake(500,.012);this.cameras.main.fadeOut(1000,0,0,0);
      this.time.delayedCall(1050,()=>{
        this.add.rectangle(W/2,H/2,W,H,0x05040a,.96).setScrollFactor(0).setDepth(220);
        this.add.text(W/2,H/2-50,'DON’T LOOK BACK',{fontFamily:'Manrope',fontSize:'43px',fontStyle:'800',color:'#f0e7f2'}).setOrigin(.5).setScrollFactor(0).setDepth(221);
        this.add.text(W/2,H/2+18,line,{fontFamily:'DM Mono',fontSize:'13px',color:'#d28c9a'}).setOrigin(.5).setScrollFactor(0).setDepth(221);
        const retry=this.add.text(W/2,H/2+95,'[ TRY AGAIN ]',{fontFamily:'DM Mono',fontSize:'14px',color:'#f0d6ff',backgroundColor:'#3a2048',padding:{x:18,y:12}}).setOrigin(.5).setScrollFactor(0).setDepth(222).setInteractive();retry.on('pointerdown',()=>this.scene.start('Game'));
      });
    }
  }

  class PauseScene extends Phaser.Scene {
    constructor(){super('Pause');}
    create(){this.input.keyboard.once('keydown-ESC',()=>{this.scene.stop();this.scene.resume('Game');});}
  }

  const config={type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#080a12',render:{antialias:true,pixelArt:false,roundPixels:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:[BootScene,TitleScene,GameScene,PauseScene]};
  window.addEventListener('load',()=>{game=new Phaser.Game(config);});
})();
