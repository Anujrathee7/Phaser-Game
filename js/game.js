let game;

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
}   

const gameOptions = {
    dudeGravity: 800,
    dudeSpeed: 230
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#112211",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                },
                debug: false
            }
        },
        scene: [LevelOne,LevelTwo, LevelTransition,GameOverScene,GameCompleteScene]
    }

    game = new Phaser.Game(gameConfig)
    window.focus();
}

class LevelOne extends Phaser.Scene {

    constructor() {
        super("LevelOne")
        this.maxHealth = 3
    }

    init(data){
        this.coinScore = 0;
        this.starScore = 0;
    }


    preload() {


        this.load.audio('jump','assets/audio/jump.wav')
        this.load.audio('coinCollect','assets/audio/coin.wav')
        this.load.image('leftKey','assets/control_keys/left.png')
        this.load.image('rightKey','assets/control_keys/right.png')
        this.load.image('upKey','assets/control_keys/jump.png')
        this.load.spritesheet('healthBar','assets/heart.png',{frameWidth: 7, frameHeight: 7})



        this.load.image("background","assets/background.png")
        this.load.image("cloud","assets/cloud.png")
        this.load.spritesheet('platform', 'assets/Platform.png',{frameWidth: 48, frameHeight: 64});
        this.load.spritesheet('coin', 'assets/coin.png',{frameWidth: 16,frameHeight: 16});
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('spikes','assets/Spike_Platform.png')
        this.load.image('fallingPlatform','assets/falling_platform.png')
        this.load.image('star','assets/star.png')
        this.load.spritesheet('spider','assets/Spider_1.png',{frameWidth: 64,frameHeight: 48})
        this.load.image('castle','assets/Tower/Tower_Blue.png')
        this.load.spritesheet('coin','assets/coin.png',{frameWidth: 16, frameHeight: 16})

        this.load.spritesheet('bird','assets/Bird_2.png',{frameWidth: 48, frameHeight: 48})
        this.load.spritesheet('tiles','assets/fantasy-tiles.png',{
            frameWidth: 64, frameHeight: 64
        })
        this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 })

        this.load.atlas('stageTwoTiles', 'assets/platformer.png', 'assets/platformer.json')

    }

    create() {
        
        // setting up sound for the game
        this.jumpSound = this.sound.add('jump');
        this.coinCollect = this.sound.add('coinCollect')



        // creating background for the game
        let bg = this.add.image(1500,100,"background")
        bg.displayWidth = game.config.width*4
        bg.scaleY = bg.scaleX

        this.add.image(300,220,'cloud').setScale(2)
        this.add.image(900,220,'cloud').setScale(2)
        this.add.image(1500,220,'cloud').setScale(2)
        this.add.image(2100,220,'cloud').setScale(2)
        this.add.image(2700,220,'cloud').setScale(2)

        this.physics.world.checkCollision.down = false;
        // Setting up cursor to take input

        this.cursors = this.input.keyboard.createCursorKeys()

        // Creating input system for touch movements
        if(isTouchDevice()){

            this.leftKey = this.add.image(600,850,'leftKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);
            this.rightKey = this.add.image(660,850,'rightKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);
            this.upKey = this.add.image(630,800,'upKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);

            this.leftKey.on("pointerdown",()=>{
                this.leftMove = true
            })

            this.leftKey.on("pointerup",()=>{
                this.leftMove = false
            })

            this.rightKey.on("pointerdown",()=>{
                this.rightMove = true
            })

            this.rightKey.on("pointerup",()=>{
                this.rightMove = false
            })

            this.upKey.on("pointerdown",()=>{
                this.upMove = true
            })

            this.upKey.on("pointerup",()=>{
                this.upMove = false
            })
        }

        this.currentHealth = this.maxHealth;
        this.healthBar = this.add.group({
            key: 'healthBar',
            repeat: this.maxHealth - 1,
            setXY: {x:750,y:30,stepX:-40}
        })

        this.healthBar.getChildren().forEach((child, index) => {
            child.setFrame(0);
            child.setScrollFactor(0);
            child.setScale(4)
            child.setDepth(100)
        });

        // Player sprite for the game
        this.dude = this.physics.add.sprite(game.config.width/2, 750, "dude")
        this.dude.body.gravity.y = gameOptions.dudeGravity


        // bird sprites for the game
        this.bird = this.physics.add.sprite(game.config.width/1.3,game.config.width/4.5,"bird").setScale(2)
        this.bird.setSize(20,20,true)
        this.bird.body.setVelocity(-100,0)

        // spider sprites for the game
        this.spider = this.physics.add.sprite(600,600,"spider").setScale(2)
        this.spider.setSize(24,16,true)
        this.spider.body.gravity.y = 100
        this.spider.body.setVelocity(-100,0)  

    
        
        // Groups for creatign ground and traps for the game
        this.immovableTrap = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        

        this.groundGroup.create(50, 950, 'tiles',0).setScale(1.5).refreshBody();
        for (let i = 0; i < 11; i++) {
            this.groundGroup.create((140 + 90*i), 950, 'tiles',1).setScale(1.5).refreshBody();
        }

        for (let i = 1; i < 11; i++){
            this.groundGroup.create((1689 + 90*i), 950, 'tiles',1).setScale(1.5).refreshBody();
        }

        this.groundGroup.create(140 + 90*28, 950, 'tiles',2).setScale(1.5).refreshBody();
        // creating platform and traps for the object

        
        this.immovableTrap.create(110,765,'spikes').setScale(1.5).refreshBody()
        this.groundGroup.create(40,790,'platform').setScale(1.5).refreshBody()
        this.groundGroup.create(110,790,'platform').setScale(1.5).refreshBody()
        this.groundGroup.create(180,790,'platform').setScale(1.5).refreshBody()


                // creating water for the player to cross in the game
        this.water = this.physics.add.staticGroup()


        this.water.create(1153,945,'stageTwoTiles','17')
        this.water.create(1153 + 128*1,945,'stageTwoTiles','17')
        this.water.create(1153 + 128*2,945,'stageTwoTiles','17')
        this.water.create(1153 + 128*3,945,'stageTwoTiles','17')
        this.water.create(1153 + 128*4,945,'stageTwoTiles','17')
        


        // creating a ground wall for the user
        this.groundGroup.create(883,582+256,'stageTwoTiles','4')
        this.groundGroup.create(883,582+128,'stageTwoTiles','4')
        this.groundGroup.create(883,582,'stageTwoTiles','4')
        this.groundGroup.create(883,582-128,'stageTwoTiles','4')
        this.groundGroup.create(883,582-256,'stageTwoTiles','4')
        this.groundGroup.create(883,582-384,'stageTwoTiles','1')

        this.groundGroup.create(1010,582+256,'stageTwoTiles','6')
        this.groundGroup.create(1010,582+128,'stageTwoTiles','6')
        this.groundGroup.create(1010, 582, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 582-128, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 582-256, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 582-384, 'stageTwoTiles', '3')

        this.add.image(880, 102, 'stageTwoTiles', 'sign2');

        // moving platform for the game
        const movingPlatform1 = this.physics.add.image(1650, 820, 'stageTwoTiles', 'platform1').setScale(0.5).setDirectControl().setImmovable();
        const movingPlatform2 = this.physics.add.image(1390, 240, 'stageTwoTiles', 'platform1').setScale(0.5).setDirectControl().setImmovable();
        const movingPlatform3 = this.physics.add.image(1170, 590, 'stageTwoTiles', 'platform1').setScale(0.5).setDirectControl().setImmovable();
        const movingPlatform4 = this.physics.add.image(1390, 425, 'stageTwoTiles', 'platform1').setScale(0.5).setDirectControl().setImmovable();

        // creating a platform for user to climb to the wall and adding coin to this platform
        this.groundGroup.create(400,670,'tiles',20).setScale(0.7)
        this.groundGroup.create(444,670,'tiles',21).setScale(0.7)
        this.groundGroup.create(488,670,'tiles',21).setScale(0.7)
        this.groundGroup.create(532,670,'tiles',21).setScale(0.7)
        this.groundGroup.create(576,670,'tiles',21).setScale(0.7)
        this.groundGroup.create(620,670,'tiles',22).setScale(0.7)
        
        
        this.groundGroup.create(70,350,'tiles',20).setScale(0.7)
        this.groundGroup.create(114,350,'tiles',21).setScale(0.7)
        this.groundGroup.create(158,350,'tiles',21).setScale(0.7)
        this.groundGroup.create(202,350,'tiles',21).setScale(0.7)
        this.groundGroup.create(246,350,'tiles',21).setScale(0.7)
        this.groundGroup.create(290,350,'tiles',22).setScale(0.7)


        this.groundGroup.create(500,250,'tiles',20).setScale(0.7)
        this.groundGroup.create(544,250,'tiles',21).setScale(0.7)
        this.groundGroup.create(588,250,'tiles',21).setScale(0.7)
        this.groundGroup.create(632,250,'tiles',21).setScale(0.7)
        this.groundGroup.create(676,250,'tiles',21).setScale(0.7)
        this.groundGroup.create(720,250,'tiles',22).setScale(0.7)

        this.groundGroup.create(50,550,'tiles',20).setScale(0.7)
        this.groundGroup.create(50+44*1,550,'tiles',21).setScale(0.7)
        this.groundGroup.create(50+44*2,550,'tiles',21).setScale(0.7)
        this.groundGroup.create(50+44*3,550,'tiles',21).setScale(0.7)
        this.groundGroup.create(50+44*4,550,'tiles',21).setScale(0.7)
        this.groundGroup.create(50+44*5,550,'tiles',22).setScale(0.7)

        // final checkoiint for the player for stage 1

        this.finalCastle = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })

        this.finalCastle.create(2300,815,'castle')
        
        // creating physics group whiich will have all the coins
        
        this.coinGroup = this.physics.add.group({
            allowGravity: true
        })

        
        // Creating coins for the player to collect
        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(405 + 40 * i,632,"coin").setScale(2)
        }

        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(505 + 40 * i,210,"coin").setScale(2)
        }

        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(80 + 40 * i,310,"coin").setScale(2)
        }

        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(60 + 40 * i,510,"coin").setScale(2)
        }

        // creating a platform which contain hidden stars

        this.starPlatform = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        this.starPlatform.create(485,470,'tiles',24).setScale(0.7)  
        this.groundGroup.create(440,470,'tiles',26).setScale(0.7)
        this.groundGroup.create(530,470,'tiles',26).setScale(0.7)  
        this.groundGroup.create(574,470,'tiles',26).setScale(0.7)  

        // creating hidden star groupfor the player to collect

        this.stars = this.physics.add.group({
            key: 'star',
            frameQuantity: 12,
            maxSize: 5,
            active: false,
            visible: false,
            enable: false,
            collideWorldBounds: true,
            bounceX: 0.5,
            bounceY: 0.5,
            dragX: 30,
            dragY: 0,
            gravityY: 200
        });


        // all the colliders for the game 

        // collider for Dude(Player)

        this.physics.add.collider(
            this.dude,
            this.starPlatform,
            (player, platform) =>
            {
                if (player.body.touching.up && platform.body.touching.down)
                {
                    this.createStar(
                        player.body.center.x,
                        platform.body.top - 16,
                        player.body.velocity.x,
                        300
                    );
                }
            });
        this.physics.add.overlap(this.dude, this.coinGroup, this.collectCoin, null, this)
        this.physics.add.overlap(this.dude,this.stars,this.collectStar,null,this)
        this.physics.add.collider(this.dude,this.finalCastle,(dude,castle)=>{
        this.scene.start("LevelTransition",{coinScore: this.coinScore,starScore: this.starScore});})
        this.physics.add.collider(this.dude, [movingPlatform1,movingPlatform2,movingPlatform3,movingPlatform4])
        this.physics.add.collider(this.dude,this.fallingplatform,(player,platform)=>{
            platform.body.moves = true;
        })
        
        this.physics.add.collider(this.dude, this.groundGroup)

        this.physics.add.collider(this.dude,this.immovableTrap,(player,trap) =>{
            if(player.body.touching.down && trap.body.touching.up){
                this.gameOver()

            }
        },null,this)

        this.physics.add.collider(this.dude,this.spider,(player,spider)=>{
            if(player.body.touching.down && spider.body.touching.up){
                this.spider.disableBody(true, true)

            }else{
                this.gameOver()
            }
        },null,this)

        this.physics.add.overlap(this.dude,this.bird,this.gameOver,null,this)


        // other colliders
        this.physics.add.collider(this.spider,this.groundGroup)
        this.physics.add.collider(this.stars,this.starPlatform)
        this.physics.add.collider(this.stars,this.groundGroup)
        this.physics.add.collider(this. stars,this.immovableTrap)
        this.physics.add.collider(this.coinGroup, this.groundGroup)





        

        // Display points collected by the player

        this.add.image(16, 16, "tiles",42).setScale(0.6).setScrollFactor(0)
        this.scoreText = this.add.text(32, 3, "0", {fontSize: "30px", fill: "#ffffff"}).setScrollFactor(0)

        this.add.image(16,48,'star').setScale(1.1).setScrollFactor(0)
        this.starText = this.add.text(32,36,"0",{fontSize: "30px",fill: '#ffffff'}).setScrollFactor(0)

        // all the animation for the game


        // moving animation for the spider

        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("spider",{start: 0 , end: 2}),
            frameRate: 10,
            repeat: -1
        })



        // Flying animation for the bird

        this.anims.create({
            key: "fly",
            frames: this.anims.generateFrameNumbers("bird",{start: 0,end:2}),
            frameRate: 10,
            repeat: -1
        })

        // animaiton for the player 

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 10,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "spin",
            frames: this.anims.generateFrameNumbers("coin",{start:0,end: 11}),
            frameRate: 10,
            repeat: -1
        })


        this.tweens.add({
            targets: this.bird,
            x: 100,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            flipX: true
        });

        this.tweens.add({
            targets: this.spider,
            x: 400,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            flipX: true
        })

        this.tweens.add({
            targets: movingPlatform1,
            x: 1170,
            duration: 3000,
            yoyo: true,
            repeat: -1
        })

        this.tweens.add({
            targets: movingPlatform2,
            x: 1170,
            duration: 1500,
            yoyo: true,
            repeat: -1
        })

        this.tweens.add({
            targets: movingPlatform3,
            x: 1370,
            duration: 1500,
            yoyo: true,
            repeat: -1
        })

        this.tweens.add({
            targets: movingPlatform4,
            x: 1650,
            duration: 1500,
            yoyo: true,
            repeat: -1
        })


        // creating a wall on the left side so user cannot leave the game area 
        const leftWall = this.add.rectangle(-5, this.scale.height / 2, 10, this.scale.height, 0x000000, 0);
        this.physics.add.existing(leftWall, true);

        this.physics.add.collider(this.dude,leftWall);

        //  Camera setting for the game
        this.cameras.main.setBounds(0, 0, 2800, 1000);
        this.cameras.main.startFollow(this.dude);

    }



    collectCoin(dude, coin) {
        coin.disableBody(true, true)
        this.coinScore += 5
        this.scoreText.setText(this.coinScore)
        this.coinCollect.play()
    }

    collectStar(dude, star) {
        star.disableBody(true, true)
        this.starScore += 1
        this.starText.setText(this.starScore)
        this.coinCollect.play()

    }

    gameOver(){

        if(this.currentHealth > 0){
            this.currentHealth --;
            this.healthBar.getChildren().forEach((child,index)=>{
                if(index<this.currentHealth){
                    child.setFrame(0);
                }else{
                    child.setFrame(4)
                }
            })
            this.dude.setPosition(450, 750)
        }
        if(this.currentHealth == 0){
            this.scene.start("GameOverScene")
        }
    }

    createStar (x, y, vx, vy)
    {
        const star = this.stars.get();

        if (!star) { return; }

        star
            .enableBody(true, x, y, true, true)
            .setVelocity(vx, vy);
    }


    

    
    update() {
        this.bird.anims.play("fly",true)
        this.spider.anims.play("move",true)

        this.coinGroup.children.iterate(function (coin) {
            coin.anims.play('spin',true);
        });

        if(this.cursors.right.isDown || this.rightMove) {
            if(this.rightMove){
                this.dude.body.velocity.x = 1.5*gameOptions.dudeSpeed

            }
            else{
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            }
            this.dude.anims.play("right", true)
        }

        else if(this.cursors.left.isDown || this.leftMove) {
            if(this.leftMove){
                this.dude.body.velocity.x = -1.5*gameOptions.dudeSpeed

            }
            else{
                this.dude.body.velocity.x = -gameOptions.dudeSpeed
            }
            
            this.dude.anims.play("left", true)
        }

        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if((this.cursors.up.isDown || this.upMove) && this.dude.body.touching.down) {
            if(this.upMove){
                this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.2

            }
            else{
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6
            }
            this.jumpSound.play();
        }

        if(this.dude.y > game.config.height) {
            this.scene.start("GameOverScene")
        }

    }



}


class LevelTransition extends Phaser.Scene {

    init(data){
        this.data = data
    }
    constructor() {
        super("LevelTransition");
    }

    preload(){
        this.load.audio('stageClear','assets/audio/stage_clear.wav')
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Level 2', {
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.stageClear = this.sound.add('stageClear')

        this.stageClear.play()

        this.time.delayedCall(6000, () => {
            this.scene.start("LevelTwo",this.data);
        });
    }
}

class LevelTwo extends Phaser.Scene {
    constructor() {
        super("LevelTwo");
    }
    init(data){
        this.data = data
        this.coinScore = data.coinScore
        this.starScore = data.starScore
        this.maxHealth = 3
    }

    preload() {

        this.load.audio('jump','assets/audio/jump.wav')
        this.load.audio('coinCollect','assets/audio/coin.wav')
        this.load.image('leftKey','assets/control_keys/left.png')
        this.load.image('rightKey','assets/control_keys/right.png')
        this.load.image('upKey','assets/control_keys/jump.png')
        this.load.audio('bouncepadSound','assets/audio/bouncepadJump.wav')
        this.load.image('star','assets/star.png')
        this.load.image('castle','assets/Tower/Tower_Blue.png')


        this.load.spritesheet('tiles','assets/fantasy-tiles.png',{
            frameWidth: 64, frameHeight: 64
        })
        // Load assets for the second level
        this.load.image("background2", "assets/background2.png");

        this.load.atlas('stageTwoTiles', 'assets/platformer.png', 'assets/platformer.json')

        this.load.image('foreground','assets/Foreground_scenery.png')

        this.load.spritesheet('bouncepad','assets/Bouncepad_Red.png',{frameWidth: 48,frameHeight: 48})

        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 })

        this.load.spritesheet('coin','assets/coin.png',{frameWidth: 16, frameHeight: 16})

        this.load.spritesheet('spider','assets/Spider_1.png',{frameWidth: 64,frameHeight: 48})

        this.load.image('cannon','assets/cannon.png')

        this.load.image('bomb','assets/bomb.png')

        this.load.image('spike','assets/Spike_Platform.png')

        this.load.spritesheet('healthBar','assets/heart.png',{frameWidth: 7, frameHeight: 7})



        // Load other assets as needed
    }

    create() {
        this.jumpSound = this.sound.add('jump');
        this.bouncepadSound = this.sound.add('bouncepadSound');


        this.coinCollect = this.sound.add('coinCollect');

        this.add.image(0, 0, "background2").setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height).setScrollFactor(0);
        this.add.image(0, -10, "foreground").setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height).setScrollFactor(0);

        // Setting up the healthbar logic for the game
        this.currentHealth = this.maxHealth;
        this.healthBar = this.add.group({
            key: 'healthBar',
            repeat: this.maxHealth - 1,
            setXY: {x:750,y:30,stepX:-40}
        })

        this.healthBar.getChildren().forEach((child, index) => {
            child.setFrame(0);
            child.setScrollFactor(0);
            child.setScale(4)
            child.setDepth(100)
        });

        // Add other game objects, platforms, enemies, etc.
        this.dude = this.physics.add.sprite(550, 650, "dude").setDepth(1000);
        this.dude.body.gravity.y = gameOptions.dudeGravity

        // bouncepad

        this.bouncepad = this.physics.add.sprite(580,893,'bouncepad').setScale(2)

        this.bouncepad.setSize(20,20,true)
        this.bouncepad.setPushable(false)

        this.bouncepad1 = this.physics.add.sprite(640,345,'bouncepad').setScale(2)
        this.bouncepad1.setSize(20,20,true)
        this.bouncepad1.setPushable(false)

        this.physics.add.collider(this.dude,this.bouncepad1,(player,bouncepad)=>{
            if(player.body.touching.down && bouncepad.body.touching.up){
                this.bouncepad1Animation = true
            }
        })


        this.spider = this.physics.add.sprite(360,480,"spider").setScale(2)
        this.spider.body.gravity.y = 100
        this.spider.setSize(24,16,true)

        // collide for the spider

        this.physics.add.collider(this.dude,this.spider,(player,spider)=>{
            if(player.body.touching.down && spider.body.touching.up){
                this.spider.disableBody(true, true)

            }else{
                this.gameOver()
            }
        },null,this)



        this.physics.add.collider(this.dude,this.bouncepad,(player,bouncepad)=>{
            if(player.body.touching.down && bouncepad.body.touching.up){
                this.bouncepadAnimation = true
            }
        })



        // Add physics, collisions, and other game logic
        this.cursors = this.input.keyboard.createCursorKeys();

        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        // ground for the player to move around

        this.groundGroup.create(70-128*1,973,'stageTwoTiles',0)
        this.groundGroup.create(70,973,'stageTwoTiles',2)
        this.groundGroup.create(198,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + 128* 1,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + 128*2,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*3,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*4,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*5,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*6,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*7,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*8,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*9,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*10,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*11,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*12,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*13,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*14,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*15,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*16,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*17,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*18,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*19,973,'stageTwoTiles',2)
        this.groundGroup.create(198 + + 128*20,973,'stageTwoTiles',2)


        // ground player will use to clear the game

        this.groundGroup.create(200,550,'stageTwoTiles','platform2')


        this.groundGroup.create(150,800,'stageTwoTiles','tree2').setScale(0.8)
        this.groundGroup.create(250,878,'stageTwoTiles','sign2')
        this.groundGroup.create(70,870,'stageTwoTiles','bush2')
        this.groundGroup.create(35,887,'stageTwoTiles','bush3')
        this.groundGroup.create(105,887,'stageTwoTiles','bush3')

        // collider for the ground grounp
        this.physics.add.collider(this.dude,this.groundGroup)
        this.physics.add.collider(this.spider,this.groundGroup)


        this.groundGroup.create(640,400,'stageTwoTiles','platform1').setScale(0.8)

        // creeating the coin group for the player to collect
        this.coinGroup = this.physics.add.group({
            allowGravity: true
        })


        this.groundGroup.create(883,589+256,'stageTwoTiles','4')
        this.groundGroup.create(883,589+128,'stageTwoTiles','4')
        this.groundGroup.create(883,589,'stageTwoTiles','4')
        this.groundGroup.create(883,589-128,'stageTwoTiles','4')
        this.groundGroup.create(883,589-256,'stageTwoTiles','4')
        this.groundGroup.create(883,589-384,'stageTwoTiles','1')

        this.groundGroup.create(1010,589+256,'stageTwoTiles','6')
        this.groundGroup.create(1010,589+128,'stageTwoTiles','6')
        this.groundGroup.create(1010, 589, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 589-128, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 589-256, 'stageTwoTiles', '6')
        this.groundGroup.create(1010, 589-384, 'stageTwoTiles', '3')

        // creating spikes for user to cross

        this.spikes = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        });



        this.spikes.create(1130,893,'spike').setScale(2)
        this.spikes.create(1223,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*1,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*2,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*3,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*4,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*5,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*6,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*7,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*8,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*9,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*10,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*11,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*12,893,'spike').setScale(2)
        this.spikes.create(1223 + 93*13,893,'spike').setScale(2)


        this.physics.add.collider(this.dude,this.spikes,(player,spike)=>{
            if(player.body.touching.down && spike.body.touching.up){
                this.gameOver()
            }
        },null,this)

        this.groundGroup.create(1130+ 93*6,660,'stageTwoTiles','platform3').setScale(0.8)
        
        // another bouncepad for the player
        this.bouncepad2 = this.physics.add.sprite(1840,607,'bouncepad').setScale(2)
        this.bouncepad2.setSize(20,20,true)
        this.bouncepad2.setPushable(false)

        this.physics.add.collider(this.dude,this.bouncepad2,(player,bouncepad)=>{
            if(player.body.touching.down && bouncepad.body.touching.up){
                this.bouncepad2Animation = true
            }
        })

        // moving platform in the game

        const movingPlatform1 = this.physics.add.image(1200, 250, 'stageTwoTiles', 'platform1').setScale(0.7).setDirectControl().setImmovable();

        const movingPlatform2 = this.physics.add.image(1950, 250, 'stageTwoTiles', 'platform1').setScale(0.7).setDirectControl().setImmovable();

        const movingPlatform3 = this.physics.add.image(2100, 650, 'stageTwoTiles', 'platform1').setScale(0.7).setDirectControl().setImmovable();

        //collider for moving platform
        this.physics.add.collider(this.dude,[movingPlatform1,movingPlatform2,movingPlatform3])



    // All the properties and collider for bomb and the cannon

        this.cannon = this.physics.add.image(890,80,'cannon')

        this.cannon.body.gravity.y = 100
        // collider for the cannon
        this.physics.add.collider(this.cannon,this.groundGroup)

        this.physics.add.collider(this.cannon,this.dude)

        this.cannon.setPushable(false)

        this.bombs = this.physics.add.group({
            active: false,
            collideWorldBounds: false,
            key: 'bomb',
            quantity: 12,
            setXY: {x:880,y:38  },
            setScale: { x: 2, y: 2},
            active: false,
            visible: false,

        })

        this.physics.add.collider(this.dude,this.bombs,(dude,bombs)=>{
            this.gameOver()
        },null,this)



        this.fireRate = 1000; // Adjust as needed

        this.fireTimer = this.time.addEvent({
            delay: this.fireRate,
            callback: this.fireBomb,
            callbackScope: this,
            loop: true
        });



        

        
        // Creating coins for the player to collect
        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(50 + 60 * i,490,"coin").setScale(2)
        }

        for(let i = 0; i < 6; i ++){
            
            this.coinGroup.create(1530 + 50 * i,605,"coin").setScale(2)
        }

        // different collider and overlap for coinGroup
        this.physics.add.collider(this.coinGroup, this.groundGroup)
        this.physics.add.overlap(this.dude, this.coinGroup, this.collectCoin, null, this)

        
        // Displaying the coin and stars collected bu the user
        this.add.image(16, 16, "tiles",42).setScale(0.6).setScrollFactor(0)
        this.scoreText = this.add.text(32, 3, this.coinScore, {fontSize: "30px", fill: "#ffffff"}).setScrollFactor(0)
        this.add.image(16,48,'star').setScale(1.1).setScrollFactor(0)
        this.starText = this.add.text(32,36,this.starScore,{fontSize: "30px",fill: '#ffffff'}).setScrollFactor(0)

        this.finalCastle = this.physics.add.group({
            allowGravity: false,
            immovable: true
        })

        this.finalCastle.create(2730,840,'castle')

        this.physics.add.collider(this.dude,this.finalCastle,(dude,castle)=>{
        this.scene.start("GameCompleteScene",{coinScore: this.coinScore,starScore: this.starScore});})


        
        
        // various animation for the game
        this.anims.create({
            key: "bouncepadMovement",
            frames: this.anims.generateFrameNumbers("bouncepad",{start:0,end:2}),
            frameRate: 10,
            repeat: false
        })

        this.anims.create({
            key: "bouncepadDefaultPosition",
            frames: this.anims.generateFrameNumbers("bouncepad",{start:2,end:0}),
            frameRate: 10,
            repeat: false
        })


        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame: 4}],
            frameRate: 10,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "spin",
            frames: this.anims.generateFrameNumbers("coin",{start:0,end: 11}),
            frameRate: 10,
            repeat: -1
        })

        this.tweens.add({
            targets: this.spider,
            x: 50,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            flipX: true
        })

        this.anims.create({
            key: "move",
            frames: this.anims.generateFrameNumbers("spider",{start: 0 , end: 2}),
            frameRate: 10,
            repeat: -1
        })

        this.tweens.add({
            targets: movingPlatform1,
            x:1400,
            duration: 1200,
            yoyo: true,
            repeat: -1,
        })

        this.tweens.add({
            targets: movingPlatform2,
            x: 2200,
            duration: 1400,
            yoyo: true,
            repeat: -1

        })

        this.tweens.add({
            targets: movingPlatform3,
            x: 2450,
            yoyo: true,
            duration: 1400,
            repeat: -1
        })

        // creating touch input for mobile device 
        if(isTouchDevice()){

            this.leftKey = this.add.image(600,850,'leftKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);
            this.rightKey = this.add.image(660,850,'rightKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);
            this.upKey = this.add.image(630,800,'upKey').setInteractive().setScale(0.7).setScrollFactor(0).setDepth(1000);

            this.leftKey.on("pointerdown",()=>{
                this.leftMove = true
            })

            this.leftKey.on("pointerup",()=>{
                this.leftMove = false
            })

            this.rightKey.on("pointerdown",()=>{
                this.rightMove = true
            })

            this.rightKey.on("pointerup",()=>{
                this.rightMove = false
            })

            this.upKey.on("pointerdown",()=>{
                this.upMove = true
            })

            this.upKey.on("pointerup",()=>{
                this.upMove = false
            })
        }


        // creating a wall on the left side so user cannot leave the game area 
        const leftWall = this.add.rectangle(-5, this.scale.height / 2, 10, this.scale.height, 0x000000, 0);
        this.physics.add.existing(leftWall, true);
        
        this.physics.add.collider(this.dude,leftWall);
        
        //  Camera setting for the game
        this.cameras.main.setBounds(0, 0, 2800, 1000);
        this.cameras.main.startFollow(this.dude);
    }


    
    collectCoin(dude, coin) {
        coin.disableBody(true, true)
        console.log(this.coinScore)
        this.coinScore += 5
        this.scoreText.setText(this.coinScore)
        this.coinCollect.play()
    }

    
    gameOver(){

        if(this.currentHealth > 0){
            this.currentHealth --;
            this.healthBar.getChildren().forEach((child,index)=>{
                if(index<this.currentHealth){
                    child.setFrame(0);
                }else{
                    child.setFrame(4)
                }
            })
            this.dude.setPosition(450, 650)
        }
        if(this.currentHealth == 0){
            this.scene.start("GameOverScene")
        }
    }

    fireBomb() {
        // Get the first inactive bomb from the group
        const bomb = this.bombs.getFirstDead(false);
    
        if (bomb) {
            // Activate the bomb
            bomb.setActive(true);
            bomb.setVisible(true);
    
            // Set the bomb's position to the cannon's position
            bomb.setPosition(this.cannon.x-20, this.cannon.y-40);
    
            // Set random velocities for the bomb
            const velocityX = Phaser.Math.Between(-200, -400);
            const velocityY = Phaser.Math.Between(100, 150);
            bomb.setVelocity(velocityX, velocityY);
    
            // Set random angular velocity
            const angularVelocity = Phaser.Math.Between(-300, 300);
            bomb.setAngularVelocity(angularVelocity);
        }
    }
    
    
    


    update() {

        this.bombs.getChildren().forEach(bomb => {
            // Check if bomb is out of bounds either horizontally or vertically
            if (bomb.x < 0 || bomb.y > this.physics.world.bounds.height) {
                bomb.setActive(false);
                bomb.setVisible(false);
            }
        });
        this.spider.anims.play('move',true)

        this.coinGroup.children.iterate(function (coin) {
            coin.anims.play('spin',true);
        });

        if(this.bouncepadAnimation){
            this.bouncepad.anims.play("bouncepadMovement",true)
            this.bouncepadSound.play()
            this.dude.body.velocity.y = - gameOptions.dudeGravity/0.9;
            this.bouncepad.anims.play("bouncepadDefaultPosition",true)
            this.bouncepadAnimation = false
        }

        if(this.bouncepad1Animation){
            this.bouncepad1.anims.play("bouncepadMovement",true)
            this.bouncepadSound.play()
            this.dude.body.velocity.y = - gameOptions.dudeGravity/0.9;
            this.bouncepad1.anims.play("bouncepadDefaultPosition",true)
            this.bouncepad1Animation = false
        }

        if(this.bouncepad2Animation){
            this.bouncepad2.anims.play("bouncepadMovement",true)
            this.bouncepadSound.play()
            this.dude.body.velocity.y = - gameOptions.dudeGravity/0.9;
            this.bouncepad2.anims.play("bouncepadDefaultPosition",true)
            this.bouncepad2Animation = false
        }
        // Handle player movement and game logic for level 2
        if(this.cursors.right.isDown || this.rightMove) {
            if(this.rightMove){
                this.dude.body.velocity.x = 1.5*gameOptions.dudeSpeed

            }
            else{
            this.dude.body.velocity.x = gameOptions.dudeSpeed
            }
            this.dude.anims.play("right", true)
        }

        else if(this.cursors.left.isDown || this.leftMove) {
            if(this.leftMove){
                this.dude.body.velocity.x = -1.5*gameOptions.dudeSpeed

            }
            else{
                this.dude.body.velocity.x = -gameOptions.dudeSpeed
            }
            
            this.dude.anims.play("left", true)
        }

        else {
            this.dude.body.velocity.x = 0
            this.dude.anims.play("turn", true)
        }

        if((this.cursors.up.isDown || this.upMove) && this.dude.body.touching.down) {
            if(this.upMove){
                this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.2

            }
            else{
            this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6
            }
            this.jumpSound.play();
        }

        if (this.dude.y > game.config.height) {
            this.scene.start("GameOverScene");
        }
    }
}


class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }

    preload() {
        this.load.audio('gameOverSound', 'assets/audio/gameover.wav');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.gameOverSound = this.sound.add('gameOverSound');
        this.gameOverSound.play({
            loop: true
        });

        this.add.text(centerX, centerY - 50, 'Game Over', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // Create the instruction text
        this.add.text(centerX, centerY + 50, 'Tap to Restart', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Add a pointer event to restart the game
        this.input.on('pointerdown', () => {
            this.gameOverSound.stop(); // Stop the game over sound
            this.scene.start('LevelOne',0); 
        });
    }
}

class GameCompleteScene extends Phaser.Scene {
    constructor() {
        super("GameCompleteScene");
    }

    preload() {
        this.load.audio('gameCompleteSound', 'assets/audio/smb_world_clear.wav');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.gameCompleteSound = this.sound.add('gameCompleteSound');
        this.gameCompleteSound.play({
            loop: true
        });

        this.add.text(centerX, centerY - 50, 'You have cleared the game', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // Create the instruction text
        this.add.text(centerX, centerY + 50, 'Tap to Restart', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Add a pointer event to restart the game
        this.input.on('pointerdown', () => {
            this.gameCompleteSound.stop(); // Stop the game over sound
            this.scene.start('LevelOne',0); 
        });
    }
}
