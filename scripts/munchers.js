$(function() {
  var ctx = $("canvas")[0].getContext("2d");
  var game = {
    paused: false,
    image_path: "images/",
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    bg: "#000079"
  };
  var grid = {
    w: 117,
    h: 72,
    cols: 6,
    rows: 5,
    x_offset: 51,
    y_offset: 66,
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
  var player = {
    lives: 3,
    sprite: newImage("player.png"),
    width: 60,
    height: 50,
    current_sprite: 0,
    sprite_delay: 3,
    facing: "r",
    moving: false,
    dead: false,
    speed: 10,
    row: 0,
    col: 0,
    move_count: 0,
    draw: function() {
      var p = this;
      if (!p.dead) {
        if (p.moving) {
          p.sprite_delay -= (p.sprite_delay) ? 1 : -3;
          if (p.current_dir === "r") {
            if (p.move_count > p.speed) {
              p.x += p.speed;
              p.move_count -= p.speed;
            }
            else {
              p.x += p.move_count;
              p.move_count = 0;
              p.moving = false;
              p.col = p.next_col;
            }
          }
          else if (p.current_dir === "u") {
            if (p.move_count > p.speed) {
              p.y -= p.speed;
              p.move_count -= p.speed;
            }
            else {
              p.y -= p.move_count;
              p.move_count = 0;
              p.moving = false;
              p.row = p.next_row;
              p.sprite_delay = 3;
            }
          }
          if (p.current_dir === "l") {
            if (p.move_count > p.speed) {
              p.x -= p.speed;
              p.move_count -= p.speed;
            }
            else {
              p.x -= p.move_count;
              p.move_count = 0;
              p.moving = false;
              p.col = p.next_col;
              p.sprite_delay = 3;
            }
          }
          else if (p.current_dir === "d") {
            if (p.move_count > p.speed) {
              p.y += p.speed;
              p.move_count -= p.speed;
            }
            else {
              p.y += p.move_count;
              p.move_count = 0;
              p.moving = false;
              p.row = p.next_row;
              p.sprite_delay = 3;
            }
          }
        }
        else {
          p.moving = (key[37] || key[38] || key[39] || key[40] && !p.moving);
          if (key[37]) { p.current_dir = "l"; }
          if (key[38]) { p.current_dir = "u"; }
          if (key[39]) { p.current_dir = "r"; }
          if (key[40]) { p.current_dir = "d"; }
          if (p.moving) {
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
            }
            else {
              (p.col === 0) ? p.moving = false : p.next_col = p.col - 1;
              p.move_count = grid.w + 3;
            }
          }
        }
        // if moving and !sprite delay, alternate sprite map position
        // if not moving, draw sprite position 0
        if (p.moving && !p.sprite_delay) {
          
        }
        ctx.drawImage(p.sprite, 0, 0, p.width, p.height, p.x, p.y, p.width, p.height);
        /*ctx.drawImage(p.sprite, 0, 0, p.width, p.height, p.x, p.y, p.width, p.height);
        if (key[37]) {
          (p.x >= p.speed) ? p.x -= p.speed : p.x = 0;
        }
        if (key[38]) {
          (p.y >= p.speed) ? p.y -= p.speed : p.y = 0;
        }
        if (key[39]) {
          (p.x + p.width <= ctx.canvas.width - p.speed) ? p.x += p.speed : p.x = ctx.canvas.width - p.width;
        }
        if (key[40]) {
          (p.y + p.height <= ctx.canvas.height - p.speed) ? p.y += p.speed : p.y = ctx.canvas.height - p.height;
        }*/
      }
    }
  };
  player.x = Math.floor(grid.x_offset + (grid.w - player.width) / 2);
  player.y = Math.floor(grid.y_offset + (grid.h - player.height) / 2);
  var key = [];
  game.running = setInterval(function() { main(); }, 34);
  $(document).bind("keydown keyup", function(e) {
    var cancel_default = (e.keyCode === 32 || (e.keyCode > 36 && e.keyCode < 41));
    key[e.which] = e.type === "keydown";
    if (e.type === "keydown" && e.keyCode === 80) {
      if (!game.paused) {
        pause();
      }
      else {
        game.paused = false;
        game.running = setInterval(function() { main(); }, 34);
      }
    }
    if (cancel_default) { e.preventDefault(); }
  });

  function main() {
    ctx.save();
    ctx.fillStyle = game.bg;
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.restore();
    player.draw();
    grid.draw();
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
    img.src = game.image_path + src;
    return img;
  }
});