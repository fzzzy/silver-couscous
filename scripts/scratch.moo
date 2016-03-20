
.program #4:play
if (player == this.playing)
  notify(player, "play " + argstr);
  parsed = parse_json(argstr);
  this.tiles[parsed["y"] + 1][parsed["x"] + 1] = parsed["play"];
  for x in (this.contents)
    notify(x, generate_json(["me" -> x.name, "here" -> x.location.name, "objs" -> x.location.contents, "tiles" -> x.location.tiles, "hand" -> x.hand]));
  endfor
  if (this.playing == this.player1)
    this.playing = this.player2;
    notify(this.player2, "It is now your turn.");
  else
    this.playing = this.player1;
    notify(this.player1, "It is now your turn.");
  endif
else
  notify(player, "It is not your turn.");
endif
.
