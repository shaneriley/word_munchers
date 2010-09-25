$(function() {
  var ctx = $("canvas")[0].getContext("2d");
  var game = {
    paused: false,
    image_path: "images/",
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    bg: "#000079",
    level: 1,
    score: 0,
    points: 5,
    correct: 0,
    font: "bold 16px 'American Typewriter'",
  };
  game.title_screen = newImage("title.jpg");
  var grid = {
    w: 117,
    h: 72,
    cols: 6,
    rows: 5,
    x_offset: 51,
    y_offset: 66,
    gutter: 3,
    fillStyle: "#fb68fd",
    draw: function() {
      var g = this,
          x_offset = 45,
          y_offset = 60;
      ctx.save();
      ctx.strokeStyle = g.fillStyle;
      ctx.lineWidth = 3;
      ctx.strokeRect(g.x_offset - 6 - .5, g.y_offset - 6 - .5, game.width - g.x_offset - 20, game.height - g.y_offset - 50);
      ctx.strokeRect(g.x_offset - 1.5, g.y_offset - 1.5, game.width - g.x_offset - 30, game.height - g.y_offset - 60);
      ctx.fillStyle = g.fillStyle;
      for (var x = 1; x < g.cols; x++) {
        ctx.fillRect(x * (g.w + 3) + g.x_offset, g.y_offset, 3, game.height - g.y_offset - 60);
      }
      for (var y = 1; y < g.rows; y++) {
        ctx.fillRect(g.x_offset, y * (g.h + 3) + g.y_offset, game.width - g.x_offset - 30, 3);
      }
      ctx.strokeStyle = game.bg;
      ctx.lineWidth = 2;
      ctx.strokeRect(g.x_offset - 4, g.y_offset - 4, game.width - g.x_offset - 25, game.height - g.y_offset - 55);
      ctx.restore();
    }
  };
  var troggles = {
    types: {
      reggie: {
        sprite: newImage("reggie.png"),
        width: 48,
        height: 50,
        min_level: 1,
        current_sprite: 0,
        sprite_delay: 3,
        speed: 10,
        present: false,
        munching: false,
        latin_name: "Trogglus normalus"
      }
    },
    enemies: [],
    wait: 50,
    next_enemy: random(300, 100),
    newEnemy: function() {
      var e = this,
          g = grid;
      for (var i in e.types) {
        var troggle = e.types[i],
            edge = random(3);
        if (troggle.min_level <= game.level && !troggle.present) {
          troggle.present = true;
          troggle.wait_count = e.wait - ((game.level < 15) ? game.level : 15);
          if (edge === 0) {
            troggle.row = random(g.rows - 1);
            troggle.col = -1;
            troggle.current_dir = "r";
          }
          else if (edge === 1) {
            troggle.row = -1;
            troggle.col = random(g.cols - 1);
            troggle.current_dir = "d";
          }
          else if (edge === 2) {
            troggle.row = random(g.rows - 1);
            troggle.col = g.cols;
            troggle.current_dir = "l";
          }
          else {
            troggle.row = g.rows;
            troggle.col = random(g.cols - 1);
            troggle.current_dir = "u";
          }
          troggle.x = Math.floor(troggle.col * (g.w + g.gutter) + g.x_offset + ((g.w - troggle.width) / 2));
          troggle.y = Math.floor(troggle.row * (g.h + g.gutter) + g.y_offset + ((g.h - troggle.height) / 2));
        }
      }
    },
    draw: function() {
      var t = this,
          g = grid;
      if (t.next_enemy) { t.next_enemy--; }
      else {
        for (var i in t.types) {
          if (t.types[i].min_level <= game.level && !t.types[i].present) {
            t.newEnemy();
          }
        }
      }
      for (var i in t.types) {
        var troggle = t.types[i],
            dir = { l: 0, r: 1, u: 2, d: 3 };
        t.entering = ((troggle.current_dir === "l" && troggle.col >= grid.cols) ||
                     (troggle.current_dir === "u" && troggle.row >= grid.rows) ||
                     (troggle.current_dir === "r" && troggle.col < 0) ||
                     (troggle.current_dir === "d" && troggle.row < 0));
        if (troggle.present) {
          (!troggle.wait_count && !troggle.moving) ? troggle.moving = true : troggle.wait_count--;
          if (troggle.moving) {
            troggle.sprite_delay -= (troggle.sprite_delay) ? 1 : -3;
            if (troggle.sprite_delay === 0) {
              troggle.current_sprite = (troggle.current_sprite % 2) ? 2 : 1;
            }
            if (!troggle.move_count) {
              if (troggle.current_dir === "l") {
                (troggle.col === -1) ? troggle.present = false : troggle.next_col = troggle.col - 1;
                troggle.move_count = g.w + g.gutter;
              }
              else if (troggle.current_dir === "u") {
                (troggle.row === -1) ? troggle.present = false : troggle.next_row = troggle.row - 1;
                troggle.move_count = g.h + g.gutter;
              }
              else if (troggle.current_dir === "r") {
                (troggle.col === g.cols) ? troggle.present = false : troggle.next_col = troggle.col + 1;
                troggle.move_count = g.w + g.gutter;
              }
              else {
                (troggle.row === g.rows) ? troggle.present = false : troggle.next_row = troggle.row + 1;
                troggle.move_count = g.h + g.gutter;
              }
            }
            else {
              moveSprite(troggle);
              if (troggle.move_count <= 10) {
                t.checkCollision(i);
              }
            }
          }
          if (troggle.present) {
            if (troggle.munching) { t.munch(troggle); }
            else {
              ctx.drawImage(troggle.sprite, troggle.current_sprite * troggle.width, troggle.height * dir[troggle.current_dir], troggle.width, troggle.height, troggle.x, troggle.y, troggle.width, troggle.height);
            }
          }
          else {
            troggle.moving = troggle.present = false;
            troggle.move_count = 0;
            t.next_enemy = random(150, 50);
          }
        }
      }
    },
    checkCollision: function(name) {
      var p = player,
          e = this.types[name];
          collided = false;
      if (e.current_dir === "l" || e.current_dir === "r") { collided = (e.next_col === p.col && e.row === p.row); }
      else if (e.current_dir === "u" || e.current_dir === "d") { collided = (e.next_row === p.row && e.col === p.col); }
      if (collided) {
        e.munching = true;
        e.sprite_delay = 3;
      }
    },
    warning: function() {
      var s = "Troggle!", y = 184;
      s = s.split("");
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      ctx.fillStyle = "white";
      ctx.font = game.font;
      ctx.textAlign = "center";
      ctx.strokeRect(5, 155, 32, 188);
      for (var i in s) {
        ctx.fillText(s[i], 21, y);
        y += 20;
      }
      ctx.restore();
    },
    munch: function(t) {
      $(document).unbind("keydown.normal keyup.normal");
      (t.sprite_delay === 0) ? t.munching = false : t.sprite_delay--;
      t.current_sprite = (t.current_sprite % 2) ? 0 : 1;
      ctx.drawImage(t.sprite, t.current_sprite * t.width, t.height * 4, t.width, t.height, t.x, t.y, t.width, t.height);
      if (!t.munching) {
        player.kill("Aargh! You were eaten by a " + t.latin_name + ".");
        t.sprite_delay = 8;
        t.munching = false;
        player.reset();
        keyBindings();
      }
    }
  };
  var player = {
    lives: 3,
    sprite: newImage("player.png"),
    width: 60,
    height: 50,
    current_sprite: 0,
    sprite_delay: 3,
    lives_sprite: 0,
    facing: "r",
    moving: false,
    munching: false,
    dead: false,
    speed: 15,
    row: 3,
    col: 1,
    move_count: 0,
    draw: function() {
      var p = this;
      (p.munching) ? p.munch() : p.lives_sprite = 0;
      if (!p.dead && !p.munching) {
        if (p.moving) {
          p.sprite_delay -= (p.sprite_delay) ? 1 : -3;
          if (p.sprite_delay === 0) {
            p.current_sprite = (p.current_sprite % 2) ? 2 : 1;
          }
          moveSprite(p);
          if (p.move_count < p.speed) { p.checkCollision(); }
        }
        else {
          p.moving = (key[37] || key[38] || key[39] || key[40] && !p.moving);
          if (key[37]) { p.current_dir = "l"; }
          if (key[38]) { p.current_dir = "u"; }
          if (key[39]) { p.current_dir = "r"; }
          if (key[40]) { p.current_dir = "d"; }
          if (p.moving) {
            p.current_sprite = 1;
            if (p.current_dir === "d") {
              (p.row >= grid.rows - 1) ? p.moving = false : p.next_row = p.row + 1;
              p.move_count = grid.h + 3;
            }
            else if (p.current_dir === "u") {
              (p.row === 0) ? p.moving = false : p.next_row = p.row - 1;
              p.move_count = grid.h + 3;
            }
            else if (p.current_dir === "r") {
              (p.col >= grid.cols - 1) ? p.moving = false : p.next_col = p.col + 1;
              p.move_count = grid.w + 3;
              p.facing = "r";
            }
            else {
              (p.col === 0) ? p.moving = false : p.next_col = p.col - 1;
              p.move_count = grid.w + 3;
              p.facing = "l";
            }
            if (!p.moving) { p.current_sprite = 0; }
          }
        }
        var y = (p.facing === "r") ? 0 : p.height;
        ctx.drawImage(p.sprite, p.current_sprite * p.width, y, p.width, p.height, p.x, p.y, p.width, p.height);
      }
    },
    munch: function() {
      var p = this,
          y = (p.facing === "r") ? 0 : p.height;
      (p.sprite_delay === 0) ? p.munching = false : p.sprite_delay--;
      p.current_sprite = (p.current_sprite % 2) ? 0 : 5;
      ctx.drawImage(p.sprite, p.current_sprite * p.width, y, p.width, p.height, p.x, p.y, p.width, p.height);
      if (answers[p.col][p.row] && words[p.col][p.row]) {
        game.score += game.points * game.level;
        words[p.col][p.row] = "";
        game.correct--;
        p.lives_sprite = 4;
      }
      else if (!answers[p.col][p.row] && p.sprite_delay === 7) {
        p.kill("Oops! That's not a correct answer!");
      }
    },
    kill: function(str) {
      var p = this;
      p.lives--;
      p.lives_sprite = 3;
      p.munching = false;
      if (p.lives) {
        dialog(str);
      }
    },
    reset: function() {
      var p = this,
          t = troggles.types;
      p.munching = false;
      p.current_sprite = 0;
      var newPosition = function() {
        p.row = random(grid.rows - 2, 1);
        p.col = random(grid.cols - 2, 1);
        for (var i in t) {
          if (p.row === t[i].row && p.col === t[i].col) {
            newPosition();
          }
        }
      };
      newPosition();
      p.x = Math.floor(grid.x_offset + (grid.w + 3) * p.col + (grid.w - p.width) / 2);
      p.y = Math.floor(grid.y_offset + (grid.h + 3) * p.row + (grid.h - p.height) / 2);
    },
    checkCollision: function() {
      var p = player,
          t = troggles.types;
      for (var i in t) {
        if (p.row === t[i].row && p.col === t[i].col) {
          t[i].munching = true;
          t[i].sprite_delay = 8;
          troggles.munch(t[i]);
        }
      }
    }
  };
  player.reset();
  var key = [],
      $word_data,
      answers = [],
      words = [];
  for (var i = 0; i < grid.cols; i++) { answers[i] = []; words[i] = []; }
  $.get("data.xml", function(r) {
    $word_data = $(r);
    createWordMatrix();
    titleScreen();
  });

  function titleScreen() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.drawImage(game.title_screen, 0, 54);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = game.font;
    ctx.fillText("Press any key to continue", game.width / 2, game.height - 30);
    $(document).bind("keydown.start_game", function(e) {
      $(this).unbind(e);
      keyBindings();
      game.running = run();
    });
    ctx.restore();
  }

  function main() {
    if (!player.lives) { gameOver(); }
    if (!game.correct) {
      dialog("Level complete!", function() {
        player.reset();
        game.level++;
        for (var i in troggles.types) {
          troggles.types[i].present = troggles.types[i].moving = false;
        }
        troggles.next_enemy = random(300, 100);
        createWordMatrix();
      });
    }
    gamebg();
    player.draw();
    troggles.draw();
    grid.draw();
    writeWords();
    gutters();
    hud();
  }

  function gamebg() {
    ctx.save();
    ctx.fillStyle = game.bg;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.restore();
  }

  function pause() {
    game.paused = true;
    clearInterval(game.running);
    ctx.save();
    ctx.fillStyle = "#ff55ff";
    ctx.globalAlpha = .7;
    ctx.fillRect(ctx.canvas.width / 2 - 80, ctx.canvas.height / 2 - 27, 160, 40);
    ctx.globalAlpha = 1;
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText("PAUSED", ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.restore();
  }

  function newImage(src) {
    var img = new Image();
    if (!("image_assets" in document)) { document.image_assets = []; }
    img.src = game.image_path + src;
    document.image_assets.push(img);
    return img;
  }

  function createWordMatrix() {
    var type;
    for (var x = 0; x < grid.cols; x++) {
      for (var y = 0; y < grid.rows; y++) {
        type = (Math.floor(Math.random() * 3)) ? "correct" : "incorrect";
        words[x][y] = $word_data.find(type + " a").eq(Math.floor(Math.random() * $word_data.find(type + " a").length)).text();
        if (type === "correct") {
          answers[x][y] = 1;
          game.correct++;
        }
        else {
          answers[x][y] = 0;
        }
      }
    }
  }

  function writeWords() {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = game.font;
    ctx.textAlign = "center";
    for (var x = 0; x < grid.cols; x++) {
      for (var y = 0; y < grid.rows; y++) {
        if (words[x][y]) {
          ctx.fillText(words[x][y], grid.x_offset + x * (grid.w + 3) + grid.w / 2, grid.y_offset + y * (grid.h + 3) + grid.h / 2 + 8);
        }
      }
    }
    ctx.restore();
  }

  function run() { return setInterval(function() { main(); }, 34); }

  function keyBindings() {
    $(document).bind("keydown.normal keyup.normal", function(e) {
      var cancel_default = (e.keyCode === 32 || (e.keyCode > 36 && e.keyCode < 41));
      key[e.which] = e.type === "keydown";
      if (key[e.which] && e.keyCode === 32 && !player.moving) {
        player.munching = true;
        player.sprite_delay = 8;
        player.current_sprite = 3;
      }
      if (key[e.which] && e.keyCode === 80) {
        if (!game.paused) {
          pause();
        }
        else {
          game.paused = false;
          game.running = run();
        }
      }
      if (cancel_default) { e.preventDefault(); }
    });
  }

  function dialog(str) {
    if (arguments[1] && typeof arguments[1] === "function") { var callback = arguments[1]; }
    clearInterval(game.running);
    setTimeout(function() {
      var y = (grid.h + 3) * 2 + grid.y_offset,
          width = (grid.w + 3) * grid.cols;
      str = str || "Please pass me at least one string to output.";
      ctx.save();
      ctx.fillStyle = grid.fillStyle;
      ctx.fillRect(grid.x_offset, y, width - 6, grid.h + 6);
      ctx.fillStyle = game.bg;
      ctx.fillRect(grid.x_offset, y + 3, width - 6, grid.h);
      ctx.fillStyle = "white";
      ctx.font = game.font;
      ctx.textAlign = "center";
      ctx.fillText(str, width / 2 + grid.x_offset, y + 32);
      ctx.fillText("Press Space Bar to continue.", width / 2 + grid.x_offset, y + 55);
      ctx.restore();
      $(document).unbind("keydown.normal keyup.normal").bind("keydown.continue", function(e) {
        if (e.keyCode === 32) {
          e.preventDefault();
          game.running = run();
          $(this).unbind(e);
          keyBindings();
          if (callback) { callback(); }
        }
      });
    }, 40);
  }

  function hud() {
    var topic_width = ctx.measureText($word_data.find("topic").text()).width,
        start_x = 372,
        p = player;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = game.font;
    ctx.textAlign = "left";
    ctx.fillText("Score:  " + game.score, 5, game.height - 22);
    ctx.fillText("Level: " + game.level, 5, 21);
    ctx.textAlign = "center";
    ctx.fillText($word_data.find("topic").text(), game.width / 2, 31);
    ctx.fillRect(game.width / 2 - topic_width, 10, topic_width * 2, 2);
    ctx.fillRect(game.width / 2 - topic_width, 41, topic_width * 2, 2);
    for (var i = 0; i < p.lives; i++) {
      ctx.drawImage(p.sprite, p.lives_sprite * p.width, 0, p.width, p.height, i * (player.width + 15) + start_x, game.height - p.height, p.width, p.height);
    }
    ctx.restore();
    if (troggles.entering) { troggles.warning(); }
  }

  function levelComplete() {
    ctx.save();
    ctx.globalAlpha = .7;
    ctx.fillStyle = game.bg;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "white";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Complete!", game.width / 2, game.height / 2 - 14);
    ctx.restore();
  }

  function gameOver() {
    clearInterval(game.running);
    setTimeout(function() {
      var p = player,
          g = game,
          t = troggles.types;
      var troggle_reset = {
        current_sprite: 0,
        sprite_delay: 3,
        speed: 10,
        present: false,
        munching: false,
        moving: false,
        move_count: 0
      };
      $(document).unbind("keyup.normal keydown.normal");
      ctx.save();
      ctx.globalAlpha = .7;
      ctx.fillStyle = game.bg;
      ctx.fillRect(0, 0, game.width, game.height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "white";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", game.width / 2, game.height / 2 - 14);
      ctx.restore();
      g.level = 1;
      g.score = 0;
      g.correct = 0;
      for (var i in t) {
        t[i] = $.extend(troggle_reset, t[i]);
      }
      p.lives = 3;
      p.sprite_delay = 3;
      p.facing = "r";
      p.moving = false;
      p.dead = false;
      p.move_count = 0;
      p.reset();
      setTimeout(function() {
        createWordMatrix();
        titleScreen();
      }, 2000);
    }, 40);
  }

  function moveSprite(p) {
    var reset = function() {
      p.move_count = 0;
      p.moving = false;
      p.sprite_delay = 3;
      p.current_sprite = 0;
      delete p.next_row;
      delete p.next_col;
      if (p.hasOwnProperty("min_level")) { p.wait_count = troggles.wait - ((game.level < 15) ? game.level : 15); }
    };
    if (p.current_dir === "r") {
      if (p.move_count > p.speed) {
        p.x += p.speed;
        p.move_count -= p.speed;
      }
      else {
        p.x += p.move_count;
        p.col = p.next_col;
        reset();
      }
    }
    else if (p.current_dir === "u") {
      if (p.move_count > p.speed) {
        p.y -= p.speed;
        p.move_count -= p.speed;
      }
      else {
        p.y -= p.move_count;
        p.row = p.next_row;
        reset();
      }
    }
    if (p.current_dir === "l") {
      if (p.move_count > p.speed) {
        p.x -= p.speed;
        p.move_count -= p.speed;
      }
      else {
        p.x -= p.move_count;
        p.col = p.next_col;
        reset();
      }
    }
    else if (p.current_dir === "d") {
      if (p.move_count > p.speed) {
        p.y += p.speed;
        p.move_count -= p.speed;
      }
      else {
        p.y += p.move_count;
        p.row = p.next_row;
        reset();
      }
    }
  }

  function gutters() {
    ctx.save();
    ctx.fillStyle = game.bg;
    ctx.fillRect(0, 0, 43, game.height);
    ctx.fillRect(0, 0, game.width, 58);
    ctx.fillRect(game.width - 25, 0, 25, game.height);
    ctx.fillRect(0, game.height - 55, game.width, 55);
    ctx.restore();
  }

  function random(max, min) {
    min = min || 0;
    return min + Math.floor(Math.random() * max);
  }
});