$(function() {
  var ctx = $("canvas")[0].getContext("2d");
  var game = {
    paused: false,
    image_path: "images/"
  };
  var player = {
    lives: 3
  };
  var key = [];
  main();
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
    ctx.fillStyle = "#000079";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
    img.src = game.image_path + src;
    return img;
  }
});;